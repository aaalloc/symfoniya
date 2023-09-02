pub mod playlist {
    pub const PLAYLIST_AUDIO_DELETE: &str = "
DELETE FROM playlists_audio 
WHERE playlist_id = (SELECT id FROM playlists WHERE name = @name)
AND audio_id = (SELECT id FROM audios WHERE path = @path)
";

    pub const AUDIO_IN_PLAYLIST_DELETE: &str = "
DELETE FROM playlists_audio
WHERE audio_id = (SELECT id FROM audios WHERE path = @path);
";
}
pub mod tag {
    pub const AUDIO_DELETE_TAG: &str = "
DELETE FROM tags
WHERE id IN (SELECT tag_id FROM audios WHERE path = @path);
";
}

pub mod audio {
    pub const AUDIO_DELETE: &str = "    
DELETE FROM audios
WHERE path = @path;
";
}
