use futures::StreamExt;
use youtube_dl::{Error, YoutubeDl, YoutubeDlOutput};

use super::async_process::AsyncProcInputTx;
#[derive(serde::Serialize, Clone)]
#[serde(tag = "type")]
pub enum ResultFromDownload {
    Result(MusicItem),
    Awaiting(TotalItem),
    Error(String),
}

#[derive(serde::Serialize, Clone)]
pub struct TotalItem {
    pub total: usize,
    pub musics: Vec<MusicItem>,
}

#[derive(serde::Serialize, Clone, Debug)]
pub struct MusicItem {
    pub title: String,
    pub link: String,
}

impl std::fmt::Display for MusicItem {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}: {}", self.title, self.link)
    }
}

fn retrieve_possible_links(url: &str) -> Vec<MusicItem> {
    let mut links: Vec<MusicItem> = Vec::new();
    let retrieved = YoutubeDl::new(url)
        .socket_timeout("15")
        .flat_playlist(true)
        .run();
    let res = retrieved.unwrap();
    match res {
        YoutubeDlOutput::Playlist(pl) => {
            for video in pl.entries.unwrap() {
                links.push(MusicItem {
                    title: video.title.unwrap(),
                    link: video.url.unwrap(),
                });
            }
        }
        YoutubeDlOutput::SingleVideo(video) => {
            links.push(MusicItem {
                title: video.title.unwrap(),
                link: video.webpage_url.unwrap(),
            });
        }
    }
    println!("Playlist: {:?}", links);
    links
}

async fn download_audio(url: &str, path: &str) -> Result<YoutubeDlOutput, Error> {
    YoutubeDl::new(url)
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

#[tauri::command]
pub async fn download_audio_from_links(
    url: String,
    path: String,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), String> {
    let links = retrieve_possible_links(&url);
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
                    }))
                    .await
                    .unwrap();
            }
            // Is it possible to have a playlist from a youtube video link?
            Ok(_) => {}
            Err(e) => {
                let async_proc_input_tx = state.inner.lock().await;
                async_proc_input_tx
                    .send(ResultFromDownload::Error(e.to_string()))
                    .await
                    .unwrap();
            }
        }
    }
    Ok(())
}
