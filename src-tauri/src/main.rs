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
fn import_from_folders(folders: Vec<String>, player: State<Arc<Mutex<MusicPlayer>>>) -> bool {
    // display folders for debug
    let mut player = player.lock().unwrap();
    for folder in &folders {
        println!("{}", folder);
    }
    for folder in folders {
        player.import(&folder);
    }
    println!("{}", player);
    if player.audios.len() > 0 {
        player.play();
        true
    } else {
        false
    }
}

fn main() {
    let (_stream, _stream_handle) = OutputStream::try_default().unwrap();
    // leak the stream to keep it alive, otherwise it will be dropped and no more audio !!!!
    // this is not a good thing but I think it is a good workaround for now ...
    let _str = Box::leak(Box::new(_stream));
    let arc_player = Arc::new(Mutex::new(MusicPlayer::new(_stream_handle)));
    tauri::Builder::default()
        .manage(arc_player)
        .invoke_handler(tauri::generate_handler![on_button_clicked])
        .invoke_handler(tauri::generate_handler![import_from_folders])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
