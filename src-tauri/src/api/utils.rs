use std::sync::MutexGuard;

use crate::music::player::MusicPlayer;

// Tag and Audio struct are used because
// serde_json can't serialize AudioStatus, but this can be changed in the future
// by changing how audio works

#[derive(serde::Serialize)]
pub struct Tag {
    title: String,
    artist: String,
    album: String,
    genre: String,
}

#[derive(serde::Serialize)]
pub struct Audio {
    title: String,
    artist: String,
    album: String,
    path: String,
    id: usize,
    duration: u64,
    cover: Vec<u8>,
}

pub fn create_audio_list(player: MutexGuard<'_, MusicPlayer>, str: &str) -> Vec<Audio> {
    let mut audios = Vec::new();
    if !str.is_empty() {
        for (id, audio) in player.playlists[str].iter().enumerate() {
            let cover = audio.cover.clone();
            audios.push(Audio {
                path: audio.path.clone(),
                title: audio.tag.title.clone(),
                artist: audio.tag.artist.clone(),
                album: audio.tag.album.clone(),
                duration: audio.duration.as_secs(),
                id,
                cover,
            });
        }
    } else {
        for (id, audio) in player.audios.iter().enumerate() {
            let cover = audio.cover.clone();
            audios.push(Audio {
                path: audio.path.clone(),
                title: audio.tag.title.clone(),
                artist: audio.tag.artist.clone(),
                album: audio.tag.album.clone(),
                duration: audio.duration.as_secs(),
                id,
                cover,
            });
        }
    }

    audios
}
