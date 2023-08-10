pub mod table {
    pub const TABLE_ARTISTS: &str = "
    CREATE TABLE artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
    );
    ";
    pub const TABLE_ALBUMS: &str = "
    CREATE TABLE albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
    );
    ";
    pub const TABLE_GENRES: &str = "
    CREATE TABLE genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE DEFAULT 'Unknown'
    );
    ";
    pub const TABLE_TAGS: &str = "
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
    ";
    pub const TABLE_FOLDERS: &str = "
    CREATE TABLE folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE
    );
    ";
    pub const TABLE_PLAYLISTS_AUDIO: &str = "
    CREATE TABLE playlists_audio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        audio_id INTEGER NOT NULL,
        FOREIGN KEY (playlist_id) REFERENCES playlists (id),
        FOREIGN KEY (audio_id) REFERENCES audios (id)
        UNIQUE (playlist_id, audio_id)
    );
    ";

    pub const TABLE_PLAYLISTS: &str = "
    CREATE TABLE playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    ";

    pub const TABLE_AUDIOS: &str = "  
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

    pub fn schema_complete() -> String {
        format!(
            "{} \n{} \n{} \n{} \n{} \n{} \n{} \n{}",
            TABLE_ARTISTS,
            TABLE_ALBUMS,
            TABLE_GENRES,
            TABLE_TAGS,
            TABLE_FOLDERS,
            TABLE_PLAYLISTS_AUDIO,
            TABLE_PLAYLISTS,
            TABLE_AUDIOS,
        )
    }
}
