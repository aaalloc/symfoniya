use duration_str::parse;
use file_format::{FileFormat, Kind};
use lofty::{Accessor, AudioFile, Probe, Tag, TagType, TaggedFileExt};
use log::{error, info};
use rodio::Decoder;
use std::time::Instant;
use std::{fs::File, io::BufReader, time::Duration};
use tauri::AppHandle;

use crate::db::database;
use crate::db::state::DbAccess;

#[macro_export]
macro_rules! update_status {
    ($status:ident, $dur:expr) => {
        match $status {
            AudioStatus::Waiting => {
                *$status = AudioStatus::Playing(Instant::now(), $dur);
            }
            AudioStatus::Stopped(instant, _duration) => {
                *$status = AudioStatus::Playing(
                    Instant::now() - Duration::from_secs(instant.as_secs()),
                    $dur,
                );
            }
            AudioStatus::Playing(_, _) => {
                *$status = AudioStatus::Waiting;
            }
        }
    };
}

pub enum AudioStatus {
    Waiting,
    Stopped(Duration, Duration),
    Playing(Instant, Duration),
}

pub fn duration_to_string(duration: Duration) -> String {
    //let milliseconds = duration.as_millis();
    let seconds = duration.as_secs() % 60;
    let minutes = (duration.as_secs() / 60) % 60;
    let hours = (duration.as_secs() / 60) / 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

#[derive(serde::Serialize)]
pub struct Status {
    pub status: String,
    pub current: u64,
    pub total: u64,
}

impl AudioStatus {
    pub fn get_status(&self) -> Status {
        match self {
            AudioStatus::Waiting => Status {
                status: self.to_string(),
                current: 0,
                total: 0,
            },
            AudioStatus::Stopped(instant, duration) => Status {
                status: self.to_string(),
                current: instant.as_secs(),
                total: duration.as_secs(),
            },
            AudioStatus::Playing(instant, duration) => Status {
                status: self.to_string(),
                current: instant.elapsed().as_secs(),
                total: duration.as_secs(),
            },
        }
    }
}

impl Clone for AudioStatus {
    fn clone(&self) -> Self {
        match self {
            AudioStatus::Waiting => AudioStatus::Waiting,
            AudioStatus::Stopped(instant, duration) => AudioStatus::Stopped(*instant, *duration),
            AudioStatus::Playing(instant, duration) => AudioStatus::Playing(*instant, *duration),
        }
    }
}

impl std::fmt::Display for AudioStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AudioStatus::Waiting => write!(f, "Waiting"),
            AudioStatus::Stopped(_, _) => {
                write!(f, "Stopped")
            }
            AudioStatus::Playing(_, _) => {
                write!(f, "Playing")
            }
        }
    }
}

#[derive(Clone)]
pub struct _Tag {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub genre: String,
}
#[derive(Clone)]
pub struct _Audio {
    pub path: String,
    pub duration: Duration,
    pub format: String,
    pub status: AudioStatus,
    pub tag: _Tag,
    pub cover: Vec<u8>,
}

pub fn get_decoder(path: &String) -> Decoder<BufReader<File>> {
    let file = BufReader::new(File::open(path).unwrap());
    Decoder::new(file).unwrap()
}

impl std::fmt::Display for _Audio {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "{} {} {} {}",
            self.path,
            duration_to_string(self.duration),
            self.format,
            self.status
        )
    }
}

impl std::cmp::PartialEq for _Audio {
    fn eq(&self, other: &Self) -> bool {
        self.path == other.path
    }
}

pub fn create_audio(path: &str, format: FileFormat) -> _Audio {
    let tagged_file = Probe::open(path)
        .expect("ERROR: Bad path provided!")
        .read()
        .expect("ERROR: Failed to read file!");
    let properties = tagged_file.properties();
    let duration = properties.duration();
    let time = parse(&(duration.as_secs().to_string() + "s")).unwrap();
    let tmp = Tag::new(TagType::Id3v2);
    let tag = match tagged_file.primary_tag() {
        Some(tag) => tag,
        None => tagged_file.first_tag().unwrap_or(&tmp),
    };
    // picture can be None
    let picture = tag.pictures().get(0);
    info!("{:?}", picture);
    let cover = match picture {
        Some(picture) => picture.data().to_vec(),
        None => Vec::new(),
    };
    _Audio {
        path: path.to_string(),
        duration: time,
        format: match format.short_name() {
            Some(name) => name.to_string(),
            None => panic!("No format"),
        },
        status: AudioStatus::Waiting,
        tag: _Tag {
            title: tag
                .title()
                .as_deref()
                .unwrap_or(path.split('/').last().unwrap())
                .to_string(),
            artist: tag.artist().as_deref().unwrap_or("Unknown").to_string(),
            album: tag.album().as_deref().unwrap_or("Unknown").to_string(),
            genre: tag.genre().as_deref().unwrap_or("Unknown").to_string(),
        },
        cover,
    }
}

pub fn get_audios(audios: &mut Vec<_Audio>, path: &str, app_handle: &AppHandle) -> usize {
    let mut count = 0;
    let paths = std::fs::read_dir(path).unwrap();
    for path in paths {
        let p = &path.unwrap().path().to_str().unwrap().to_string();
        if audios.iter().any(|audio| audio.path == *p) {
            info!("Audio already in list");
            continue;
        }
        let format = FileFormat::from_file(p);
        let format = match format {
            Ok(format) => format,
            Err(format) => {
                info!("Unsupported format {:?}", format);
                continue;
            }
        };
        if match format.kind() {
            Kind::Audio => {
                match app_handle.db(|db| database::is_audio_in_db(db, p)) {
                    Ok(true) => {
                        info!("Audio already in db");
                    }
                    Ok(false) => {
                        let audio = create_audio(p, format);
                        app_handle.db(|db| database::add_audio(&audio, db)).unwrap();
                        audios.push(audio);
                        count += 1;
                    }
                    Err(e) => {
                        error!("{}", e);
                        return 0;
                    }
                }
                true
            }
            _ => false,
        } {}
    }
    count
}
