pub mod playlist {
    pub const PLAYLIST_AUDIO_DELETE: &str = "
DELETE FROM playlists_audio 
WHERE playlist_id = (SELECT id FROM playlists WHERE name = @name)
AND audio_id = (SELECT id FROM audios WHERE path = @path)
";
}
