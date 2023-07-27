use rodio::Sink;
use std::time::Duration;
pub mod audio;
use crate::{player::audio::*, update_status};
use audio::{AudioStatus, _Audio};
use std::time::Instant;
pub struct MusicPlayer {
    pub total_time: Duration,
    pub audios: Vec<_Audio>,
    pub is_playing: bool,
    sink: Sink,
    stream_handle: rodio::OutputStreamHandle,
    index: usize,
}

pub trait Player {
    fn new(stream_handler: rodio::OutputStreamHandle) -> Self;
    fn add_audio(&mut self, audio: _Audio) -> bool;
    fn import(&mut self, path: &str) -> usize;
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
        }
    }

    fn add_audio(&mut self, audio: _Audio) -> bool {
        self.audios.push(audio);
        true
    }

    fn import(&mut self, path: &str) -> usize {
        let value = get_audios(self.audios.as_mut(), path);
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
}
