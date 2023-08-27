use std::{
    fs::File,
    sync::{Arc, Mutex},
};

use tauri::{AppHandle, State};

use crate::{
    db::{database, state::DbAccess},
    music::player::{MusicPlayer, Player},
};

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
pub fn play_from_id(
    id: usize,
    path: String,
    app_handle: AppHandle,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    if File::open(&player.audios[id].path).is_err() {
        println!("File not found: {}", player.audios[id].path);
        let result = app_handle.db(|db| database::delete_audio(db, &player.audios[id].path));
        match result {
            Ok(_) => println!("Audio deleted from db"),
            Err(e) => println!("Error: {}", e),
        }
        // update the player (Audio list and Playlist hashmap)
        //player.audios.remove(id);
        player.playlists.get_mut("all").unwrap().remove(id);

        Ok(false)
    } else {
        println!("{} {}", player.get_current_audio().path, path);
        if player.get_current_audio().path != path
            || player.get_current_audio().path == path && player.is_playing
        {
            player.update_sink(id);
        }
        player.set_index(id);
        player.play();
        Ok(true)
    }
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
