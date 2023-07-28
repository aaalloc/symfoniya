// thx to https://github.com/RandomEngy/tauri-sqlite/tree/main
use crate::audio::_Audio;
#[path = "./sql_requests.rs"]
mod sql_requests;
use rusqlite::{named_params, Connection};
use std::fs;
use tauri::AppHandle;

const CURRENT_DB_VERSION: u32 = 1;

/// Initializes the database connection, creating the .sqlite file if needed, and upgrading the database
/// if it's out of date.
pub fn initialize_database(app_handle: &AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    println!("app_dir: {:?}", app_dir);
    fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    let sqlite_path = app_dir.join("symfoniya.sqlite");

    let mut db = Connection::open(sqlite_path)?;

    let mut user_pragma = db.prepare("PRAGMA user_version")?;
    let existing_user_version: u32 = user_pragma.query_row([], |row| row.get(0))?;
    drop(user_pragma);

    upgrade_database_if_needed(&mut db, existing_user_version)?;

    Ok(db)
}

/// Upgrades the database to the current version.
pub fn upgrade_database_if_needed(
    db: &mut Connection,
    existing_version: u32,
) -> Result<(), rusqlite::Error> {
    if existing_version < CURRENT_DB_VERSION {
        db.pragma_update(None, "journal_mode", "WAL")?;
        let tx = db.transaction()?;
        tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;
        tx.pragma_update(None, "foreign_keys", 1)?;
        tx.execute_batch(DB_SCHEMA)?;
        tx.commit()?;
    }

    Ok(())
}

pub fn add_audio(audio: &_Audio, db: &Connection) -> Result<(), rusqlite::Error> {
    let mut artist_statement = db.prepare(sql_requests::ARTIST_INSERT)?;
    artist_statement.execute(named_params! { "@name": audio.tag.artist })?;

    let mut album_statement = db.prepare(sql_requests::ALBUM_INSERT)?;
    album_statement.execute(named_params! { "@name": audio.tag.album })?;

    let mut genre_statement = db.prepare(sql_requests::GENRE_INSERT)?;
    genre_statement.execute(named_params! { "@name": audio.tag.genre })?;

    let mut tag_statement = db.prepare(sql_requests::TAG_INSERT)?;
    tag_statement.execute(named_params! {
        "@artist": audio.tag.artist,
        "@album": audio.tag.album,
        "@genre": audio.tag.genre,
    })?;
    let mut audio_statement = db.prepare(sql_requests::AUDIO_INSERT)?;
    audio_statement.execute(named_params! {
        "@path": audio.path,
        "@duration": audio.duration.as_secs(),
        "@title": audio.tag.title,
        "@cover": audio.cover,
        "@artist": audio.tag.artist,
        "@album": audio.tag.album,
        "@genre": audio.tag.genre,
    })?;

    Ok(())
}

const DB_SCHEMA: &str = "
CREATE TABLE artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
);

CREATE TABLE albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
);

CREATE TABLE genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL UNIQUE,
    album_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists (id),
    FOREIGN KEY (album_id) REFERENCES albums (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id)
);

CREATE TABLE audios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    duration INTEGER NOT NULL,
    title TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    cover BLOB,
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);
";
