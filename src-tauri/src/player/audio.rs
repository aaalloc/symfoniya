use file_format::{FileFormat, Kind};
use parse_duration::parse;
use rodio::{Decoder, Source};
use std::time::Instant;
use std::{fs::File, io::BufReader, time::Duration};

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

impl Clone for AudioStatus {
    fn clone(&self) -> Self {
        match self {
            AudioStatus::Waiting => AudioStatus::Waiting,
            AudioStatus::Stopped(instant, duration) => {
                AudioStatus::Stopped(instant.clone(), duration.clone())
            }
            AudioStatus::Playing(instant, duration) => {
                AudioStatus::Playing(instant.clone(), duration.clone())
            }
        }
    }
}

pub fn duration_to_string(duration: Duration) -> String {
    //let milliseconds = duration.as_millis();
    let seconds = duration.as_secs() % 60;
    let minutes = (duration.as_secs() / 60) % 60;
    let hours = (duration.as_secs() / 60) / 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

impl std::fmt::Display for AudioStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AudioStatus::Waiting => write!(f, "Waiting"),
            AudioStatus::Stopped(instant, duration) => {
                write!(f, "Stopped {} {}", instant.as_secs(), duration.as_secs())
            }
            AudioStatus::Playing(instant, duration) => {
                write!(
                    f,
                    "Playing {} {}",
                    instant.elapsed().as_secs(),
                    duration.as_secs()
                )
            }
        }
    }
}

pub struct Audio {
    pub path: String,
    pub duration: Duration,
    pub format: String,
    pub status: AudioStatus,
}

pub fn get_decoder(path: String) -> Decoder<BufReader<File>> {
    let file = BufReader::new(File::open(path).unwrap());
    let source = Decoder::new(file).unwrap();
    source
}

impl Clone for Audio {
    fn clone(&self) -> Self {
        Audio {
            path: self.path.clone(),
            duration: self.duration.clone(),
            format: self.format.clone(),
            status: self.status.clone(),
        }
    }
}

impl std::fmt::Display for Audio {
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

pub fn create_audio(path: &str, format: FileFormat) -> Audio {
    let metadata =
        metadata::media_file::MediaFileMetadata::new(&std::path::Path::new(path)).unwrap();
    let duration = metadata._duration;
    let time = match duration {
        Some(time) => match parse(&String::from(time.to_string() + "s")) {
            Ok(time) => time,
            Err(_) => panic!("Error"),
        },
        None => panic!("No duration"),
    };

    Audio {
        path: path.to_string(),
        duration: time,
        format: match format.short_name() {
            Some(name) => name.to_string(),
            None => panic!("No format"),
        },
        status: AudioStatus::Waiting,
    }
}

pub fn get_audios(path: &str) -> Vec<Audio> {
    let mut audios = Vec::new();
    let paths = std::fs::read_dir(path).unwrap();
    for path in paths {
        let p = &path.unwrap().path().to_str().unwrap().to_string().clone();
        let format = FileFormat::from_file(p);
        let format = match format {
            Ok(format) => format,
            Err(_) => continue,
        };
        if match format.kind() {
            Kind::Audio => {
                audios.push(create_audio(p, format));
                true
            }
            _ => false,
        } {}
    }
    audios
}
