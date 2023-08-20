use std::sync::{Arc, Mutex};

use tauri::{AppHandle, State};

use crate::music::player::{MusicPlayer, Player};

#[tauri::command]
pub fn import_from_folders(
    folders: Vec<String>,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
    app_handle: AppHandle,
) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    let mut total_imported = 0;
    for folder in folders {
        total_imported += player.import_from_folders(&folder, &app_handle);
    }
    player.write_to_db(app_handle);
    println!("{}", player);
    drop(player);
    Ok(total_imported)
}

#[tauri::command]
pub fn play_from_id(id: usize, player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    // TODO FIX: When the user click on the same audio, there is a bug
    // TODO: when file is deleted, the player should skip to the next audio and delete the audio from the db
    player.update_sink(id);
    player.set_index(id);
    player.play();
    Ok(true)
}

#[tauri::command]
pub fn pause(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    player.pause();
    Ok(true)
}

#[tauri::command]
pub fn update_player(
    playlist: String,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<(), String> {
    let mut player = player.lock().unwrap();
    player.audios = player.playlists[&playlist].clone();
    Ok(())
}
