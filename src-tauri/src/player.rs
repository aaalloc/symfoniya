use rodio::Sink;
use std::time::Duration;
mod audio;
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
    fn import(&mut self, path: &str) -> bool;
    fn set_index(&mut self, index: usize);
    fn update_total_time(&mut self);
    fn play(&mut self);
    fn pause(&mut self);
    fn update_sink(&mut self, index: usize);
    fn next(&mut self) -> usize;
    fn previous(&mut self);
    fn is_end_of_audio(&self) -> bool;
    fn get_audio(&self, index: usize) -> &_Audio;
    fn get_current_audio(&self) -> &_Audio;
    //fn set_volume(&mut self, volume: f32);
    //fn get_volume(&self) -> f32;
    //fn stop(&mut self);
}

//unsafe impl Send for MusicPlayer {}

//unsafe impl Sync for MusicPlayer {}

impl std::fmt::Display for MusicPlayer {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for audio in &self.audios {
            write!(f, "{}\n", audio)?;
        }
        write!(f, "Total time {}", duration_to_string(self.total_time))?;
        Ok(())
    }
}

impl Player for MusicPlayer {
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

    fn import(&mut self, path: &str) -> bool {
        let audios = get_audios(path);
        if audios.len() == 0 {
            return false;
        }
        for audio in audios {
            self.add_audio(audio);
        }
        self.update_total_time();
        true
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
        let current_audio;
        if !self.sink.empty() {
            self.sink.play();
        } else {
            self.sink
                .append(get_decoder(self.audios[self.index].path.clone()));
        }
        current_audio = self.audios.get_mut(self.index);
        if let Some(item) = current_audio {
            let status = &mut item.status;
            update_status!(status, item.duration);
        }
        self.is_playing = true;
    }

    fn pause(&mut self) {
        self.sink.pause();
        if let Some(item) = self.audios.first_mut() {
            let status = &mut item.status;
            match status {
                AudioStatus::Waiting => {}
                AudioStatus::Stopped(_, _) => {}
                AudioStatus::Playing(instant, duration) => {
                    *status = AudioStatus::Stopped(instant.elapsed(), *duration);
                }
            }
            self.is_playing = false;
        }
    }

    fn update_sink(&mut self, index: usize) {
        let next_audio = self.audios.get_mut(index).unwrap();
        let next_audio_status = &mut next_audio.status;
        self.sink = Sink::try_new(&self.stream_handle).unwrap();
        self.sink.append(get_decoder(next_audio.path.clone()));
        update_status!(next_audio_status, next_audio.duration);
    }

    fn next(&mut self) -> usize {
        let len = self.audios.len() - 1;
        if len == self.index {
            return 0;
        } else {
            self.audios.get_mut(self.index).unwrap().status = AudioStatus::Waiting;
            self.index += 1;
            self.sink.stop();
            if self.index < len {
                self.update_sink(self.index);
            }
        }
        len - self.index
    }

    fn previous(&mut self) {
        if self.index > 0 {
            self.audios.get_mut(self.index).unwrap().status = AudioStatus::Waiting;
            self.index -= 1;
            self.sink.stop();
            self.update_sink(self.index);
        }
    }

    fn is_end_of_audio(&self) -> bool {
        let current_audio = self.audios.get(self.index).unwrap();
        let current_audio_status = &current_audio.status;
        match current_audio_status {
            AudioStatus::Waiting => false,
            AudioStatus::Stopped(_, _) => false,
            AudioStatus::Playing(instant, duration) => {
                if instant.elapsed() >= *duration {
                    true
                } else {
                    false
                }
            }
        }
    }

    fn get_audio(&self, index: usize) -> &_Audio {
        self.audios.get(index).unwrap()
    }

    fn get_current_audio(&self) -> &_Audio {
        self.audios.get(self.index).unwrap()
    }
}
