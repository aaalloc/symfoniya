pub mod artist {
    pub const ARTIST_INSERT: &str = "
INSERT OR IGNORE INTO artists (name)
VALUES (@name)
";
}

pub mod album {
    pub const ALBUM_INSERT: &str = "
INSERT OR IGNORE INTO albums (name)
VALUES (@name)
";
}

pub mod genre {
    pub const GENRE_INSERT: &str = "
INSERT OR IGNORE INTO genres (name)
VALUES (@name)
";
}

pub mod tag {
    pub const TAG_INSERT: &str = "
INSERT OR IGNORE INTO tags (artist_id, album_id, genre_id)
VALUES (
        (SELECT id FROM artists WHERE name = @artist),
        (SELECT id FROM albums WHERE name = @album),
        (SELECT id FROM genres WHERE name = @genre)
    )
ON CONFLICT (artist_id, album_id, genre_id) DO NOTHING
";
}

pub mod folder {
    pub const FOLDER_INSERT: &str = "
INSERT OR IGNORE INTO folders (path)
VALUES (@path)
";
}

pub mod audio {
    pub const AUDIO_INSERT: &str = "
INSERT OR IGNORE INTO audios (path, duration, title, cover, folder_id, tag_id)
VALUES (
    @path,
    @duration,
    @title,
    @cover,
    (SELECT id FROM folders WHERE path = @folder),
    (SELECT id FROM tags WHERE artist_id = (SELECT id FROM artists WHERE name = @artist) 
    AND album_id = (SELECT id FROM albums WHERE name = @album) 
    AND genre_id = (SELECT id FROM genres WHERE name = @genre))
)
";
}

pub mod playlist {
    pub const PLAYLIST_INSERT: &str = "
INSERT OR IGNORE INTO playlists (name)
VALUES (@name)
";

    pub const PLAYLIST_AUDIO_INSERT: &str = "
INSERT OR IGNORE INTO playlists_audio (playlist_id, audio_id)
VALUES (
    (SELECT id FROM playlists WHERE name = @name),
    (SELECT id FROM audios WHERE path = @path)
)
";
}

pub mod recent {
    pub const RECENT_INSERT: &str = "
INSERT OR REPLACE INTO recents (audio_id, date)
VALUES (
    (SELECT id FROM audios WHERE path = @path),
    strftime('%Y-%m-%d %H:%M:%f', 'now')
)
";
}
