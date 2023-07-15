#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
mod player;
use player::{MusicPlayer, Player};
use rodio::OutputStream;
use tauri::State;

#[derive(serde::Serialize)]
struct Audio {
    title: String,
    artist: String,
    album: String,
    id: usize,
    duration: u64,
}

#[tauri::command]
fn on_button_clicked() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
    format!("on_button_clicked called from Rust! (timestamp: {since_the_epoch}ms)")
}

#[tauri::command]
async fn import_from_folders(
    folders: Vec<String>,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<usize, String> {
    // display folders for debug
    let mut player = player.lock().unwrap();
    for folder in &folders {
        println!("{}", folder);
    }
    for folder in folders {
        player.import(&folder);
    }
    println!("{}", player);
    let len = player.audios.len();
    drop(player);
    return Ok(len);
}

#[tauri::command]
async fn retrieve_audios(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<Vec<Audio>, String> {
    let player = player.lock().unwrap();
    let mut audios = Vec::new();
    for (id, audio) in player.audios.iter().enumerate() {
        audios.push(Audio {
            title: audio.path.clone(),
            artist: "Nilfruits".to_string(),
            album: "IDK".to_string(),
            duration: audio.duration.as_secs(),
            id: id,
        });
    }
    drop(player);
    Ok(audios)
}

fn main() {
    let (_stream, _stream_handle) = OutputStream::try_default().unwrap();
    // leak the stream to keep it alive, otherwise it will be dropped and no more audio !!!!
    // this is not a good thing but I think it is a good workaround for now ...
    let _str = Box::leak(Box::new(_stream));
    let arc_player = Arc::new(Mutex::new(MusicPlayer::new(_stream_handle)));
    tauri::Builder::default()
        .manage(arc_player)
        .invoke_handler(tauri::generate_handler![
            import_from_folders,
            retrieve_audios
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
