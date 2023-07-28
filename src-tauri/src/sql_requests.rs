pub const ARTIST_INSERT: &str = "
INSERT OR IGNORE INTO artists (name)
VALUES (@name)
";

pub const ALBUM_INSERT: &str = "
INSERT OR IGNORE INTO albums (name)
VALUES (@name)
";

pub const GENRE_INSERT: &str = "
INSERT OR IGNORE INTO genres (name)
VALUES (@name)
";

pub const TAG_INSERT: &str = "
INSERT OR IGNORE INTO tags (artist_id, album_id, genre_id)
VALUES (
    (SELECT id FROM artists WHERE name = @artist),
    (SELECT id FROM albums WHERE name = @album),
    (SELECT id FROM genres WHERE name = @genre)
)
";

pub const AUDIO_INSERT: &str = "
INSERT OR IGNORE INTO audios (path, duration, title, cover, tag_id)
VALUES (
    @path,
    @duration,
    @title,
    @cover,
    (SELECT id FROM tags WHERE artist_id = (SELECT id FROM artists WHERE name = @artist) 
    AND album_id = (SELECT id FROM albums WHERE name = @album) 
    AND genre_id = (SELECT id FROM genres WHERE name = @genre))
)
";
