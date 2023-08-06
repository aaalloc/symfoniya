use rodio::Sink;
use std::{collections::HashMap, time::Duration};

use crate::{database, db::state::DbAccess, music::audio::*, update_status};
use std::time::Instant;
use tauri::AppHandle;
pub struct MusicPlayer {
    pub total_time: Duration,
    pub audios: Vec<_Audio>,
    pub is_playing: bool,
    pub playlists: HashMap<String, Vec<_Audio>>,
    sink: Sink,
    stream_handle: rodio::OutputStreamHandle,
    index: usize,
}

pub trait Player {
    fn new(stream_handler: rodio::OutputStreamHandle) -> Self;
    fn add_audio(&mut self, audio: _Audio) -> bool;
    fn import_from_folders(&mut self, path: &str, app_handle: &AppHandle) -> usize;
    fn import_from_db(&mut self, app_handle: &AppHandle) -> Result<usize, rusqlite::Error>;
    fn set_index(&mut self, index: usize);
    fn update_total_time(&mut self);
    fn play(&mut self);
    fn pause(&mut self);
    fn update_sink(&mut self, index: usize);
    fn next(&mut self) -> usize;
    fn previous(&mut self);
    fn current_audio_status(&self) -> AudioStatus;
    fn get_audio(&self, index: usize) -> &_Audio;
    fn get_current_audio(&self) -> &_Audio;
    fn set_volume(&mut self, volume: f32);
    fn get_volume(&self) -> f32;
    //fn stop(&mut self);
    fn get_index(&self) -> usize;
    fn write_to_db(&self, app_handle: AppHandle);
}

//unsafe impl Send for MusicPlayer {}

//unsafe impl Sync for MusicPlayer {}

impl std::fmt::Display for MusicPlayer {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for audio in &self.audios {
            writeln!(f, "{}", audio)?;
        }
        write!(f, "Total time {}", duration_to_string(self.total_time))?;
        Ok(())
    }
}

impl Player for MusicPlayer {
    fn get_index(&self) -> usize {
        self.index
    }

    fn new(stream_handler: rodio::OutputStreamHandle) -> Self {
        MusicPlayer {
            total_time: Duration::new(0, 0),
            audios: Vec::new(),
            sink: Sink::try_new(&stream_handler).unwrap(),
            is_playing: false,
            stream_handle: stream_handler,
            index: 0,
            playlists: HashMap::new(),
        }
    }

    fn add_audio(&mut self, audio: _Audio) -> bool {
        self.audios.push(audio);
        true
    }

    fn import_from_folders(&mut self, path: &str, app_handle: &AppHandle) -> usize {
        let value = get_audios(self.audios.as_mut(), path, app_handle);
        self.update_total_time();
        value
    }

    fn import_from_db(&mut self, app_handle: &AppHandle) -> Result<usize, rusqlite::Error> {
        let value = app_handle.db(|db| database::get_audios(db, self.audios.as_mut()));
        self.playlists
            .insert("all".to_string(), self.audios.clone());
        self.update_total_time();
        value
    }

    fn set_index(&mut self, index: usize) {
        self.index = index;
    }

    fn update_total_time(&mut self) {
        // TODO: This works but not optimal, to be improved
        let mut total_time = Duration::new(0, 0);
        for audio in &self.audios {
            total_time += audio.duration;
        }
        self.total_time = total_time;
    }

    fn play(&mut self) {
        if !self.sink.empty() {
            self.sink.play();
        } else {
            self.sink.append(get_decoder(&self.audios[self.index].path));
        }
        let current_audio = self.audios.get_mut(self.index);
        if let Some(item) = current_audio {
            let status = &mut item.status;
            update_status!(status, item.duration);
        }
        self.is_playing = true;
    }

    fn pause(&mut self) {
        self.sink.pause();
        if let Some(item) = self.audios.get_mut(self.index) {
            let status = &mut item.status;
            if let AudioStatus::Playing(instant, _) = status {
                *status = AudioStatus::Stopped(instant.elapsed(), item.duration);
            }
            self.is_playing = false;
        }
    }

    fn update_sink(&mut self, index: usize) {
        let next_audio = self.audios.get_mut(index).unwrap();
        next_audio.status = AudioStatus::Waiting;
        let previous_volume = self.sink.volume();
        self.sink = Sink::try_new(&self.stream_handle).unwrap();
        self.sink.set_volume(previous_volume);
    }

    fn next(&mut self) -> usize {
        self.index = (self.index + 1) % self.audios.len();
        self.update_sink(self.index);
        self.index
    }

    fn previous(&mut self) {
        self.index = (self.index + self.audios.len() - 1) % self.audios.len();
        self.update_sink(self.index);
    }

    fn current_audio_status(&self) -> AudioStatus {
        let current_audio = self.audios.get(self.index).unwrap();
        current_audio.status.clone()
    }

    fn get_audio(&self, index: usize) -> &_Audio {
        self.audios.get(index).unwrap()
    }

    fn get_current_audio(&self) -> &_Audio {
        self.audios.get(self.index).unwrap()
    }

    fn set_volume(&mut self, volume: f32) {
        self.sink.set_volume(volume);
    }

    fn get_volume(&self) -> f32 {
        self.sink.volume()
    }

    fn write_to_db(&self, app_handle: AppHandle) {
        for audio in self.audios.iter() {
            app_handle.db(|db| database::add_audio(audio, db)).unwrap();
        }
        println!("{} audios added", self.audios.len());
    }
}
