#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex, MutexGuard};
mod db;
mod music;
use crate::music::player::Player;
use db::{
    database,
    state::{DbAccess, DbState},
};
use music::player::MusicPlayer;
use rodio::OutputStream;
use tauri::{AppHandle, Manager, State};

#[derive(serde::Serialize)]
struct Tag {
    title: String,
    artist: String,
    album: String,
    genre: String,
}

#[derive(serde::Serialize)]
struct Audio {
    title: String,
    artist: String,
    album: String,
    path: String,
    id: usize,
    duration: u64,
    cover: Vec<u8>,
}

fn create_audio_list(player: MutexGuard<'_, MusicPlayer>, str: &str) -> Vec<Audio> {
    let mut audios = Vec::new();
    for (id, audio) in player.playlists[str].iter().enumerate() {
        let cover = audio.cover.clone();
        audios.push(Audio {
            path: audio.path.clone(),
            title: audio.tag.title.clone(),
            artist: audio.tag.artist.clone(),
            album: audio.tag.album.clone(),
            duration: audio.duration.as_secs(),
            id,
            cover,
        });
    }

    audios
}

#[tauri::command]
async fn startup_audios_init(
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
async fn import_from_folders(
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
fn retrieve_audios(
    playlists: String,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<Vec<Audio>, String> {
    let str = playlists.as_str();
    let player = player.lock().unwrap();
    Ok(create_audio_list(player, str))
}

#[tauri::command]
async fn play_from_id(
    id: usize,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    // TODO FIX: When the user click on the same audio, there is a bug
    player.update_sink(id);
    player.set_index(id);
    player.play();
    Ok(true)
}

#[tauri::command]
async fn pause(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    player.pause();
    Ok(true)
}

#[tauri::command]
fn current_audio_status(
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<(String, u64, u64), String> {
    let mut player = player.lock().unwrap();
    let status = player.current_audio_status();
    let formated = status.get_status();
    let index = player.get_index();
    if formated.1 == formated.2 && formated.0 == "Playing" {
        player.update_sink(index);
    }
    Ok(formated)
}

#[tauri::command]
fn set_volume(volume: f32, player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    player.set_volume(volume);
    Ok(true)
}

#[tauri::command]
fn get_volume(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<f32, String> {
    let player = player.lock().unwrap();
    Ok(player.get_volume())
}

#[tauri::command]
fn goto_next(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    let index = player.next();
    Ok(index)
}

#[tauri::command]
fn goto_previous(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<usize, String> {
    let mut player = player.lock().unwrap();
    player.previous();
    Ok(player.get_index())
}

#[tauri::command]
fn create_playlist(name: String, app_handle: AppHandle) -> Result<(), String> {
    let result = app_handle.db(|db| database::add_playlist(db, &name));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn add_audio_to_playlist(
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
fn is_in_playlist(playlist: String, path: String, app_handle: AppHandle) -> Result<bool, String> {
    let result = app_handle.db(|db| database::is_in_playlist(db, &playlist, &path));
    match result {
        Ok(state) => Ok(state),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn get_playlists(app_handle: AppHandle) -> Result<Vec<String>, String> {
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
fn get_audio_playlist(
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

#[tauri::command]
fn update_player(
    playlist: String,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<(), String> {
    let mut player = player.lock().unwrap();
    player.audios = player.playlists[&playlist].clone();
    Ok(())
}

fn main() {
    let (_stream, _stream_handle) = OutputStream::try_default().unwrap();
    // leak the stream to keep it alive, otherwise it will be dropped and no more audio !!!!
    // this is not a good thing but I think it is a good workaround for now ...
    let _str = Box::leak(Box::new(_stream));
    let arc_player = Arc::new(Mutex::new(MusicPlayer::new(_stream_handle)));
    tauri::Builder::default()
        .manage(arc_player)
        .manage(DbState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            import_from_folders,
            retrieve_audios,
            play_from_id,
            pause,
            current_audio_status,
            set_volume,
            get_volume,
            goto_next,
            goto_previous,
            startup_audios_init,
            create_playlist,
            add_audio_to_playlist,
            get_audio_playlist,
            get_playlists,
            is_in_playlist,
            update_player
        ])
        .setup(|app| {
            let handle = app.handle();
            let app_state: State<DbState> = handle.state();
            let db =
                database::initialize_database(&handle).expect("Database initialize should succeed");
            *app_state.db.lock().unwrap() = Some(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
