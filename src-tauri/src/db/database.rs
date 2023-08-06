// thx to https://github.com/RandomEngy/tauri-sqlite/tree/main
#[path = "./sql_requests.rs"]
mod sql_requests;
use rusqlite::{named_params, Connection};
use std::fs;
use tauri::AppHandle;

use crate::music::audio::{_Audio, _Tag};

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
    let folder = audio.path.rsplit_once('/').unwrap().0;
    let mut folder_statement = db.prepare(sql_requests::FOLDER_INSERT)?;
    folder_statement.execute(named_params! { "@path": folder })?;

    let mut audio_statement = db.prepare(sql_requests::AUDIO_INSERT)?;
    audio_statement.execute(named_params! {
        "@path": audio.path,
        "@folder": folder,
        "@duration": audio.duration.as_secs(),
        "@title": audio.tag.title,
        "@cover": audio.cover,
        "@artist": audio.tag.artist,
        "@album": audio.tag.album,
        "@genre": audio.tag.genre,
    })?;

    Ok(())
}

pub fn get_audios(db: &Connection, audios: &mut Vec<_Audio>) -> Result<usize, rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::AUDIO_SELECT)?;
    let audios_iter = statement.query_map([], |row| {
        Ok(_Audio {
            path: row.get(0)?,
            duration: std::time::Duration::from_secs(row.get(1)?),
            tag: _Tag {
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                genre: row.get(5)?,
            },
            cover: row.get(6)?,
            format: String::from("mp3"),
            status: crate::music::audio::AudioStatus::Waiting,
        })
    })?;
    audios_iter
        .filter(|a| a.is_ok())
        .for_each(|a| audios.push(a.unwrap()));

    audios.sort_by(|a, b| a.path.cmp(&b.path));
    audios.dedup_by(|a, b| a.path == b.path);
    Ok(audios.len())
}

pub fn is_audio_in_db(db: &Connection, path: &str) -> Result<bool, rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::AUDIO_IN_FOLDER_SELECT)?;
    let mut results = statement.query(&[(":path", &path)])?;
    // needs to simplify, one result is attended
    while let Some(result) = results.next()? {
        let result: i16 = result.get(0)?;
        if result == 0 {
            return Ok(false);
        }
    }
    Ok(true)
}

pub fn add_playlist(db: &Connection, playlist_name: &str) -> Result<(), rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::PLAYLIST_INSERT)?;
    statement.execute(named_params! {
        "@name": playlist_name
    })?;
    Ok(())
}

pub fn retrieve_playlist(db: &Connection) -> Result<Vec<String>, rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::PLAYLIST_SELECT)?;
    let mut results = statement.query([])?;
    let mut playlists = Vec::new();
    while let Some(result) = results.next()? {
        let result: String = result.get(0)?;
        if playlists.contains(&result) {
            continue;
        }
        playlists.push(result);
    }
    Ok(playlists)
}

pub fn is_in_playlist(
    db: &Connection,
    playlist_name: &str,
    path: &str,
) -> Result<bool, rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::AUDIO_IN_PLAYLIST_SELECT)?;
    let mut results = statement.query(&[(":name", &playlist_name), (":path", &path)])?;
    while let Some(result) = results.next()? {
        let result: i16 = result.get(0)?;
        if result == 1 {
            return Ok(true);
        }
    }
    Ok(false)
}

pub fn insert_audio_in_playlist(
    db: &Connection,
    state: bool,
    playlist_name: &str,
    path: &str,
) -> Result<(), rusqlite::Error> {
    let mut statement;
    if state {
        statement = db.prepare(sql_requests::PLAYLIST_AUDIO_INSERT)?;
    } else {
        statement = db.prepare(sql_requests::PLAYLIST_AUDIO_DELETE)?;
    }
    statement.execute(named_params! {
        "@name": playlist_name,
        "@path": path
    })?;
    Ok(())
}

pub fn get_audios_from_playlist(
    db: &Connection,
    playlist_name: &str,
) -> Result<Vec<_Audio>, rusqlite::Error> {
    let mut statement = db.prepare(sql_requests::PLAYLIST_AUDIO_SELECT)?;
    let audios_iter = statement.query_map(&[("@name", &playlist_name)], |row| {
        Ok(_Audio {
            path: row.get(0)?,
            duration: std::time::Duration::from_secs(row.get(1)?),
            tag: _Tag {
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                genre: row.get(5)?,
            },
            cover: row.get(6)?,
            format: String::from("mp3"),
            status: crate::music::audio::AudioStatus::Waiting,
        })
    })?;
    let mut audios = Vec::new();
    audios_iter
        .filter(|a| a.is_ok())
        .for_each(|a| audios.push(a.unwrap()));

    audios.sort_by(|a, b| a.path.cmp(&b.path));
    audios.dedup_by(|a, b| a.path == b.path);
    Ok(audios)
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
    artist_id INTEGER NOT NULL,
    album_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (artist_id) REFERENCES artists (id),
    FOREIGN KEY (album_id) REFERENCES albums (id),
    FOREIGN KEY (genre_id) REFERENCES genres (id)
    UNIQUE (artist_id, album_id, genre_id)
);

CREATE TABLE folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE
);

CREATE TABLE playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    audio_id INTEGER,
    FOREIGN KEY (audio_id) REFERENCES audios (id)
    UNIQUE (name, audio_id)
);

CREATE TABLE audios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    duration INTEGER NOT NULL,
    title TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    folder_id INTEGER NOT NULL,
    cover BLOB,
    FOREIGN KEY (tag_id) REFERENCES tags (id)
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);
";