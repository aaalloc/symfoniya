#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::{Arc, Mutex};
mod db;
mod music;
use crate::{api::*, music::player::Player};
use db::{database, state::DbState};
use music::player::MusicPlayer;
use rodio::OutputStream;
use tauri::{Manager, State};

mod api;
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
            player::import_from_folders,
            player::play_from_id,
            player::pause,
            player::update_player,
            audio::retrieve_audios,
            audio::current_audio_status,
            audio::set_volume,
            audio::get_volume,
            audio::goto_next,
            audio::goto_previous,
            audio::shuffle,
            audio::startup_audios_init,
            playlist::create_playlist,
            playlist::add_audio_to_playlist,
            playlist::get_audio_playlist,
            playlist::get_playlists,
            playlist::is_in_playlist
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
