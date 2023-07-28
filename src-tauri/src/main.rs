#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
mod db;
mod music;
use crate::music::player::Player;
use db::{database, state::DbState};
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
    id: usize,
    duration: u64,
    cover: Vec<u8>,
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
async fn retrieve_audios(player: State<'_, Arc<Mutex<MusicPlayer>>>) -> Result<Vec<Audio>, String> {
    let player = player.lock().unwrap();
    let mut audios = Vec::new();
    for (id, audio) in player.audios.iter().enumerate() {
        let cover = audio.cover.clone();
        audios.push(Audio {
            title: audio.tag.title.clone(),
            artist: audio.tag.artist.clone(),
            album: audio.tag.album.clone(),
            duration: audio.duration.as_secs(),
            id,
            cover,
        });
    }
    drop(player);
    Ok(audios)
}

#[tauri::command]
async fn play_from_id(
    id: usize,
    player: State<'_, Arc<Mutex<MusicPlayer>>>,
) -> Result<bool, String> {
    let mut player = player.lock().unwrap();
    if player.get_index() == id {
        player.play();
        Ok(true)
    } else {
        player.update_sink(id);
        player.set_index(id);
        player.play();
        Ok(true)
    }
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
            startup_audios_init
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
