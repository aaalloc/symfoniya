use tokio::sync::mpsc;

use super::ytdlp_wrapper::ResultFromDownload;

pub struct AsyncProcInputTx {
    pub inner: tokio::sync::Mutex<mpsc::Sender<ResultFromDownload>>,
}

pub async fn async_process_model(
    mut input_rx: mpsc::Receiver<ResultFromDownload>,
    output_tx: mpsc::Sender<ResultFromDownload>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    while let Some(input) = input_rx.recv().await {
        let output = input;
        output_tx.send(output).await?;
    }

    Ok(())
}
