#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::{SystemTime, UNIX_EPOCH};
mod player;
use player::{MusicPlayer, Player};
use tauri::Manager;

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
fn import_from_folders(folders: Vec<String>) -> bool {
    // display folders for debug
    for folder in &folders {
        println!("{}", folder);
    }
    let mut player: MusicPlayer = MusicPlayer::new();
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
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![on_button_clicked])
        .invoke_handler(tauri::generate_handler![import_from_folders])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
