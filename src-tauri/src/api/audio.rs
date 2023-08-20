use std::sync::{Arc, Mutex};

use tauri::{AppHandle, State};

use crate::{
    api::utils::create_audio_list,
    api::utils::Audio,
    music::{
        audio::Status,
        player::{MusicPlayer, Player},
    },
};

#[tauri::command]
pub fn startup_audios_init(
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
    app_handle: AppHandle,
) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    let total_from_db = player.import_from_db(&app_handle);
    match total_from_db {
        Ok(total) => Ok(total),
        Err(e) => {
            println!("{}", e);
            Ok(0)
        }
    }
}

#[tauri::command]
pub fn retrieve_audios(
    playlists: String,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<Vec<Audio>, String> {
    let str = playlists.as_str();
    let player = player.lock().unwrap();
    Ok(create_audio_list(player, str))
}

#[tauri::command]
pub fn current_audio_status(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<Status, String> {
    let mut player = player.lock().unwrap();
    let status = player.current_audio_status().get_status();
    let index = player.get_index();
    if status.current == status.total && status.status == "Playing" {
        player.update_sink(index);
    }
    Ok(status)
}

#[tauri::command]
pub fn set_volume(volume: f32, player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    player.set_volume(volume);
    Ok(true)
}

#[tauri::command]
pub fn get_volume(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<f32, String> {
    let player = player.lock().unwrap();
    Ok(player.get_volume())
}

#[tauri::command]
pub fn goto_next(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    let index = player.next();
    Ok(index)
}

#[tauri::command]
pub fn goto_previous(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    player.previous();
    Ok(player.get_index())
}

#[tauri::command]
pub fn shuffle(
    playlist: String,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<Vec<Audio>, String> {
    let mut player = player.lock().unwrap();
    player.shuffle(playlist.as_str());
    Ok(create_audio_list(player, playlist.as_str()))
}
