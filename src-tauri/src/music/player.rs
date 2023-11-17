use log::info;
use rodio::Sink;
use std::{collections::HashMap, path::PathBuf, time::Duration};

use crate::{database, db::state::DbAccess, music::audio::*, update_status};
use rand::prelude::*;
use std::time::Instant;
use tauri::AppHandle;
pub struct MusicPlayer {
    pub total_time: Duration,
    pub audios: Vec<_Audio>,
    pub current_audio: _Audio,
    pub is_playing: bool,
    pub playlists: HashMap<String, Vec<_Audio>>,
    sink: Sink,
    stream_handle: rodio::OutputStreamHandle,
    index: usize,
}

pub trait Player {
    fn new(stream_handler: rodio::OutputStreamHandle) -> Self;
    fn add_audio(&mut self, audio: _Audio) -> bool;
    fn import_from_folders(
        &mut self,
        path: PathBuf,
        app_handle: &AppHandle,
    ) -> Result<usize, String>;
    fn import_from_db(&mut self, app_handle: &AppHandle) -> Result<usize, rusqlite::Error>;
    fn set_index(&mut self, index: usize);
    fn update_total_time(&mut self);
    fn play(&mut self);
    fn pause(&mut self);
    fn update_sink(&mut self, index: usize);
    fn next(&mut self) -> usize;
    fn previous(&mut self);
    fn seek(&mut self, duration: Duration);
    fn current_audio_status(&self) -> AudioStatus;
    fn get_audio(&self, index: usize) -> &_Audio;
    fn set_volume(&mut self, volume: f32);
    fn get_volume(&self) -> f32;
    fn shuffle(&mut self, playlist: &str);
    fn speed_up(&mut self);
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
            current_audio: _Audio {
                path: String::new(),
                duration: Duration::new(0, 0),
                status: AudioStatus::Waiting,
                format: String::new(),
                tag: _Tag {
                    title: String::new(),
                    artist: String::new(),
                    album: String::new(),
                    genre: String::new(),
                },
                cover: Vec::new(),
            },
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

    fn import_from_folders(
        &mut self,
        path: PathBuf,
        app_handle: &AppHandle,
    ) -> Result<usize, String> {
        info!("Importing from {}", path.display());
        let value = get_audios(self.audios.as_mut(), path, app_handle);
        match value {
            Ok(value) => {
                self.audios.sort_by(|a, b| a.path.cmp(&b.path));
                self.playlists
                    .insert("all".to_string(), self.audios.clone());
                self.update_total_time();
                info!("{}", log::as_display!(self));
                Ok(value)
            }
            Err(e) => {
                log::error!("{}", e);
                Err(e.to_string())
            }
        }
    }

    fn import_from_db(&mut self, app_handle: &AppHandle) -> Result<usize, rusqlite::Error> {
        info!("Importing from db");
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
        let current_status = self.current_audio_status().get_status();
        if !self.is_playing && current_status.status == "Stopped" {
            self.sink.play();
        } else {
            self.sink.append(get_decoder(&self.audios[self.index].path));
        }
        let current_audio = self.audios.get_mut(self.index);
        if let Some(item) = current_audio {
            let status = &mut item.status;
            update_status!(status, item.duration);
        }
        self.current_audio = self.audios.get(self.index).unwrap().clone();
        self.is_playing = true;
        info!("Playing {}", self.current_audio.path);
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
        info!("Paused {}", self.current_audio.path);
    }

    fn update_sink(&mut self, index: usize) {
        let next_audio = self.audios.get_mut(index);
        match next_audio {
            Some(item) => {
                item.status = AudioStatus::Waiting;
                let previous_volume = self.sink.volume();
                self.sink = Sink::try_new(&self.stream_handle).unwrap();
                self.sink.set_volume(previous_volume);
            }
            None => {
                info!("No audio found at index {}", index);
                return;
            }
        }
    }

    fn seek(&mut self, duration: Duration) {
        self.sink.try_seek(duration).unwrap();
        if let Some(item) = self.audios.get_mut(self.index) {
            let status = &mut item.status;
            if let AudioStatus::Playing(instant, _) = status {
                *instant = Instant::now() - duration;
            }
        }
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

    fn set_volume(&mut self, volume: f32) {
        self.sink.set_volume(volume);
        info!("Volume set to {}", volume);
    }

    fn get_volume(&self) -> f32 {
        self.sink.volume()
    }

    fn shuffle(&mut self, playlist: &str) {
        let mut rng = rand::thread_rng();
        self.playlists.get_mut(playlist).unwrap().shuffle(&mut rng);
        match self.playlists.get(playlist) {
            Some(audios) => self.audios = audios.to_vec(),
            None => {
                info!("No playlist found with name {}", playlist);
                return;
            }
        }
    }

    fn speed_up(&mut self) {
        if self.is_playing {
            self.sink.set_speed(self.sink.speed() * 1.1);
        }
    }

    fn write_to_db(&self, app_handle: AppHandle) {
        for audio in self.audios.iter() {
            app_handle.db(|db| database::add_audio(audio, db)).unwrap();
        }
        info!("{} audios added", self.audios.len());
    }
}
