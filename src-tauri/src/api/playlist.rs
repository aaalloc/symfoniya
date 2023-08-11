use std::sync::{Arc, Mutex};

use tauri::{AppHandle, State};

use crate::{
    api::utils::create_audio_list,
    api::utils::Audio,
    db::{database, state::DbAccess},
    music::player::MusicPlayer,
};

#[tauri::command]
pub fn create_playlist(name: String, app_handle: AppHandle) -> Result<(), String> {
    let result = app_handle.db(|db| database::add_playlist(db, &name));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn add_audio_to_playlist(
    state: bool,
    playlist: String,
    path: String,
    app_handle: AppHandle,
) -> Result<(), String> {
    let result =
        app_handle.db(|db| database::insert_audio_in_playlist(db, state, &playlist, &path));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn is_in_playlist(
    playlist: String,
    path: String,
    app_handle: AppHandle,
) -> Result<bool, String> {
    let result = app_handle.db(|db| database::is_in_playlist(db, &playlist, &path));
    match result {
        Ok(state) => Ok(state),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn get_playlists(app_handle: AppHandle) -> Result<Vec<String>, String> {
    let result = app_handle.db(database::retrieve_playlist);
    match result {
        Ok(playlists) => match playlists.len() {
            0 => Err("No playlists found".to_string()),
            _ => match playlists[0].as_str() {
                "" => Err("No playlists".to_string()),
                _ => Ok(playlists),
            },
        },
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn get_audio_playlist(
    playlist: String,
    app_handle: AppHandle,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<Vec<Audio>, String> {
    let mut player = player.lock().unwrap();
    let str = &playlist;
    if str == "all" {
        Ok(create_audio_list(player, str))
    } else {
        let result = app_handle.db(|db| database::get_audios_from_playlist(db, str));
        match result {
            Ok(list) => {
                player.playlists.insert(str.to_string(), list);
                Ok(create_audio_list(player, str))
            }
            Err(e) => Err(e.to_string()),
        }
    }
}
