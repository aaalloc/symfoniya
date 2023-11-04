use futures::StreamExt;
use tokio::sync::{mpsc, Mutex};
use youtube_dl::{Error, YoutubeDl, YoutubeDlOutput};
pub struct AsyncProcInputTx {
    pub inner: Mutex<mpsc::Sender<Vec<String>>>,
}

fn retrieve_possible_links(url: &str) -> Vec<String> {
    let mut links: Vec<String> = Vec::new();
    let retrieved = YoutubeDl::new(url)
        .socket_timeout("15")
        .flat_playlist(true)
        .run();
    let res = retrieved.unwrap();
    match res {
        YoutubeDlOutput::Playlist(pl) => {
            for video in pl.entries.unwrap() {
                links.push(video.url.unwrap());
            }
        }
        YoutubeDlOutput::SingleVideo(video) => {
            links.push(video.webpage_url.unwrap());
        }
    }
    println!("Playlist: {:?}", links);
    links
}

async fn download_audio(link: &str) -> Result<YoutubeDlOutput, Error> {
    YoutubeDl::new(link)
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
        .extra_arg("/home/yanovskyy/Musique/test")
        .extra_arg("--no-simulate")
        .extra_arg("--no-progress")
        .run_async().await
}

#[tauri::command]
pub async fn download_audio_from_links(
    url: String,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), String> {
    let links = retrieve_possible_links(&url);
    let mut futures = futures::stream::FuturesUnordered::new();
    for link in &links {
        futures.push(async move { download_audio(link).await });
    }
    while let Some(res) = futures.next().await {
        match res {
            Ok(YoutubeDlOutput::SingleVideo(video)) => {
                let async_proc_input_tx = state.inner.lock().await;
                async_proc_input_tx
                    .send(vec![video.title.unwrap()])
                    .await
                    .unwrap();
            }
            // We ignore Playlist Result
            Ok(_) => {}
            Err(e) => {
                let async_proc_input_tx = state.inner.lock().await;
                async_proc_input_tx.send(vec![e.to_string()]).await.unwrap();
            }
        }
    }
    Ok(())
}
