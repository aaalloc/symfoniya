use duration_str::parse;
use file_format::{FileFormat, Kind};
use lofty::{Accessor, AudioFile, Probe, Tag, TagType, TaggedFileExt};
use rodio::Decoder;
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

pub fn duration_to_string(duration: Duration) -> String {
    //let milliseconds = duration.as_millis();
    let seconds = duration.as_secs() % 60;
    let minutes = (duration.as_secs() / 60) % 60;
    let hours = (duration.as_secs() / 60) / 60;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

impl AudioStatus {
    pub fn get_status(&self) -> (String, u64, u64) {
        match self {
            AudioStatus::Waiting => (self.to_string(), 0, 0),
            AudioStatus::Stopped(instant, duration) => {
                (self.to_string(), instant.as_secs(), duration.as_secs())
            }
            AudioStatus::Playing(instant, duration) => (
                self.to_string(),
                instant.elapsed().as_secs(),
                duration.as_secs(),
            ),
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

pub struct _Tag {
    pub title: String,
    pub artist: String,
    pub album: String,
    pub genre: String,
}

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
    println!("{:?}", picture);
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

pub fn get_audios(audios: &mut Vec<_Audio>, path: &str) -> usize {
    let mut count = 0;
    let paths = std::fs::read_dir(path).unwrap();
    for path in paths {
        let p = &path.unwrap().path().to_str().unwrap().to_string();
        if audios
            .iter()
            .any(|audio| audio.path.split('/').last().unwrap() == p.split('/').last().unwrap())
        {
            continue;
        }
        let format = FileFormat::from_file(p);
        let format = match format {
            Ok(format) => format,
            Err(_) => continue,
        };
        if match format.kind() {
            Kind::Audio => {
                audios.push(create_audio(p, format));
                count += 1;
                true
            }
            _ => false,
        } {}
    }
    count
}
