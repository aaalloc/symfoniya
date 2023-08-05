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
ON CONFLICT (artist_id, album_id, genre_id) DO NOTHING
";

pub const FOLDER_INSERT: &str = "
INSERT OR IGNORE INTO folders (path)
VALUES (@path)
";

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

pub const PLAYLIST_INSERT: &str = "
INSERT OR IGNORE INTO playlists (name)
VALUES (@name)
";

pub const PLAYLIST_AUDIO_INSERT: &str = "
INSERT OR IGNORE INTO playlists (name, audio_id)
VALUES (
    @name,
    (SELECT id FROM audios WHERE path = @path)
)
";

pub const PLAYLIST_AUDIO_DELETE: &str = "
DELETE FROM playlists
WHERE name = @name
AND audio_id = (SELECT id FROM audios WHERE path = @path)
";

pub const PLAYLIST_AUDIO_SELECT: &str = "
SELECT path, duration, title, artists.name, albums.name, genres.name, cover
FROM audios
INNER JOIN tags ON audios.tag_id = tags.id
INNER JOIN artists ON tags.artist_id = artists.id
INNER JOIN albums ON tags.album_id = albums.id
INNER JOIN genres ON tags.genre_id = genres.id
INNER JOIN playlists ON audios.id = playlists.audio_id
WHERE playlists.name = @name
";

pub const AUDIO_IN_PLAYLIST_SELECT: &str = "
SELECT COUNT(1)
FROM playlists
WHERE name = :name
AND audio_id = (SELECT id FROM audios WHERE path = :path)
";

pub const PLAYLIST_SELECT: &str = "
SELECT name
FROM playlists
";

pub const AUDIO_SELECT: &str = "
SELECT path, duration, title, artists.name, albums.name, genres.name, cover
FROM audios
INNER JOIN tags ON audios.tag_id = tags.id
INNER JOIN artists ON tags.artist_id = artists.id
INNER JOIN albums ON tags.album_id = albums.id
INNER JOIN genres ON tags.genre_id = genres.id
";

pub const AUDIO_IN_FOLDER_SELECT: &str = "
SELECT COUNT(1)
FROM audios
WHERE path = :path
";
