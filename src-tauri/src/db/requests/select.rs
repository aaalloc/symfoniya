pub mod playlist {
    pub const PLAYLIST_AUDIO_SELECT: &str = "
SELECT path, duration, title, artists.name, albums.name, genres.name, cover
FROM audios
INNER JOIN tags ON audios.tag_id = tags.id
INNER JOIN artists ON tags.artist_id = artists.id
INNER JOIN albums ON tags.album_id = albums.id
INNER JOIN genres ON tags.genre_id = genres.id
INNER JOIN playlists_audio ON audios.id = playlists_audio.audio_id
WHERE playlists_audio.playlist_id = (SELECT id FROM playlists WHERE name = @name)
";

    pub const PLAYLIST_SELECT: &str = "
SELECT name
FROM playlists
";
}

pub mod audio {
    pub const AUDIO_IN_PLAYLIST_SELECT: &str = "
SELECT COUNT(1)
FROM playlists_audio
WHERE playlist_id = (SELECT id FROM playlists WHERE name = @name)
AND audio_id = (SELECT id FROM audios WHERE path = @path)
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
}
