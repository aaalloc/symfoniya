use lazy_static::lazy_static;
use log::info;
use std::{ffi::OsStr, process::Command};
use tokio::sync::RwLock;

use futures::StreamExt;
use youtube_dl::{Error, YoutubeDl, YoutubeDlOutput};

use super::async_process::AsyncProcInputTx;
#[derive(serde::Serialize, Clone)]
#[serde(tag = "type")]
pub enum ResultFromDownload {
    Result(MusicItem),
    Awaiting(TotalItem),
    Error(ErrorItem),
}

lazy_static! {
    pub static ref YT_DLP_BIN_PATH: RwLock<String> = RwLock::new({
        #[cfg(target_os = "windows")]
        {
            "yt-dlp.exe".to_string()
        }
        #[cfg(not(target_os = "windows"))]
        {
            "yt-dlp".to_string()
        }
    });
}

#[derive(serde::Serialize, Clone)]
pub struct TotalItem {
    pub total: usize,
    pub musics: Vec<MusicItem>,
}

#[derive(serde::Serialize, Clone, Debug)]
pub struct MusicItem {
    pub title: String,
    pub duration: serde_json::Value,
    pub link: String,
}

#[derive(serde::Serialize, Clone, Debug)]
pub struct ErrorItem {
    pub error: String,
}

impl std::fmt::Display for MusicItem {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}: {}", self.title, self.link)
    }
}

fn retrieve_possible_links(url: &str, yt_dlp_path: &str) -> Result<Vec<MusicItem>, Error> {
    let mut links: Vec<MusicItem> = Vec::new();
    let retrieved = YoutubeDl::new(url)
        .youtube_dl_path(yt_dlp_path)
        .socket_timeout("15")
        .flat_playlist(true)
        .run();
    let res = retrieved?;
    match res {
        YoutubeDlOutput::Playlist(pl) => {
            for video in pl.entries.unwrap() {
                links.push(MusicItem {
                    title: video.title.unwrap(),
                    link: video.url.unwrap(),
                    duration: video.duration.unwrap(),
                });
            }
        }
        YoutubeDlOutput::SingleVideo(video) => {
            links.push(MusicItem {
                title: video.title.unwrap(),
                link: video.webpage_url.unwrap(),
                duration: video.duration.unwrap(),
            });
        }
    }
    println!("Playlist: {:?}", links);
    Ok(links)
}

async fn download_audio(url: &str, path: &str) -> Result<YoutubeDlOutput, Error> {
    let yt_dlp_path = YT_DLP_BIN_PATH.read().await;

    YoutubeDl::new(url)
    .youtube_dl_path(yt_dlp_path.as_str())
        .socket_timeout("15")
        .extract_audio(true)
        .extra_arg("-x")
        .extra_arg("--continue")
        .extra_arg(r#"-o %(title)s.%(ext)s"#)
        .extra_arg("--prefer-ffmpeg")
        .extra_arg("--ppa")
        .extra_arg("ThumbnailsConvertor+FFmpeg_o:-c:v mjpeg -vf crop=\"'if(gt(ih,iw),iw,ih)':'if(gt(iw,ih),ih,iw)'\"")
        .extra_arg("--embed-metadata")
        .extra_arg("--embed-thumbnail")
        .extra_arg("--audio-format")
        .extra_arg("mp3")
        .extra_arg("-P")
        .extra_arg(path)
        .extra_arg("--no-simulate")
        .extra_arg("--no-progress")
        .run_async().await
}

pub enum YtDlpBin {
    InPath,
    InAppDir,
}

pub fn check_ytdl_bin(app_dir_path: &OsStr) -> Result<YtDlpBin, String> {
    // we check if user has yt-dlp installed
    info!("Checking yt-dlp binary in PATH and at {:?}", app_dir_path);
    match Command::new("yt-dlp").arg("--version").output() {
        Ok(_) => {
            info!("yt-dlp found in PATH");
            Ok(YtDlpBin::InPath)
        }
        Err(e) => {
            if e.kind() == std::io::ErrorKind::NotFound {
                let rt = tokio::runtime::Runtime::new().unwrap();
                let yt_dlp_path: String = rt.block_on(async {
                    let yt_dlp_path = YT_DLP_BIN_PATH.read().await;
                    yt_dlp_path.clone()
                });
                match Command::new(format!(
                    "{}/{}",
                    app_dir_path.to_str().unwrap(),
                    yt_dlp_path.as_str()
                ))
                .arg("--version")
                .output()
                {
                    Ok(_) => {
                        info!("yt-dlp found at {:?}", app_dir_path);
                        Ok(YtDlpBin::InAppDir)
                    }
                    Err(e) => {
                        if e.kind() == std::io::ErrorKind::NotFound {
                            Err("yt-dlp not found".to_string())
                        } else {
                            Err(e.to_string())
                        }
                    }
                }
            } else {
                Err(e.to_string())
            }
        }
    }
}

#[tauri::command]
pub async fn download_audio_from_links(
    url: String,
    path: String,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), String> {
    let yt_dlp_path = YT_DLP_BIN_PATH.read().await;
    let res_links = retrieve_possible_links(&url, yt_dlp_path.as_str());
    let links = match res_links {
        Ok(links) => links,
        Err(e) => {
            let async_proc_input_tx = state.inner.lock().await;
            async_proc_input_tx
                .send(ResultFromDownload::Error(ErrorItem {
                    error: e.to_string(),
                }))
                .await
                .unwrap();
            return Err(e.to_string());
        }
    };
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(ResultFromDownload::Awaiting(TotalItem {
            total: links.len(),
            musics: links.clone(),
        }))
        .await
        .unwrap();
    drop(async_proc_input_tx);
    let mut futures = futures::stream::FuturesUnordered::new();
    links.iter().for_each(|link| {
        let path = path.clone();
        futures.push(async move { download_audio(&link.link, &path).await });
    });
    while let Some(res) = futures.next().await {
        match res {
            Ok(YoutubeDlOutput::SingleVideo(video)) => {
                let async_proc_input_tx = state.inner.lock().await;
                async_proc_input_tx
                    .send(ResultFromDownload::Result(MusicItem {
                        title: video.title.unwrap(),
                        link: video.webpage_url.unwrap(),
                        duration: video.duration.unwrap(),
                    }))
                    .await
                    .unwrap();
            }
            // Is it possible to have a playlist from a youtube video link?
            Ok(_) => {}
            Err(e) => {
                let async_proc_input_tx = state.inner.lock().await;
                async_proc_input_tx
                    .send(ResultFromDownload::Error(ErrorItem {
                        error: e.to_string(),
                    }))
                    .await
                    .unwrap();
            }
        }
    }
    Ok(())
}
