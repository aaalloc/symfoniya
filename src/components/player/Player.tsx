/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { invoke } from "@tauri-apps/api/tauri"
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { Audio } from "@/components/types/audio"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { format_duration } from "@/lib/utils"

import { Button } from "../ui/button"
import VolumeButton from "./Volume"

interface AudioStatus {
  status: string
  current: number
  total: number
}

function isObjectEmpty(objectName: object) {
  return Object.keys(objectName).length === 0
}

export async function shuffle(
  name: string,
  currentPlaylistListening: string,
  setAudioList: (audios: Audio[]) => void,
  setOldAudioList: (audios: Audio[]) => void,
) {
  const audios: Audio[] = await invoke("shuffle", { playlist: name })
  if (name === currentPlaylistListening || currentPlaylistListening === "") {
    setAudioList(audios)
  } else {
    setOldAudioList(audios)
  }
}

export function Player() {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState({ current: 0 } as AudioStatus)
  const { audio } = useContext(AppContext)
  const { setAudioById } = useContext(AppContext)
  const { currentPlaylistListening } = useContext(AppContext)
  const { setAudioList, setOldAudioList } = useContext(AppContext)

  const play = async () => {
    if (status.current === audio.duration) {
      status.current = 0
      //props.setter(props.currentAudio.id)
    }
    await invoke("play_from_id", { id: audio.id })
    setIsPlaying(true)
  }
  const pause = async () => {
    await invoke("pause")
    setIsPlaying(false)
  }

  const next = async () => {
    const id: number = await invoke("goto_next")
    await invoke("play_from_id", { id: id })
    console.debug(id)
    setAudioById(id)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const previous = async () => {
    const id: number = await invoke("goto_previous")
    await invoke("play_from_id", { id: id })
    setAudioById(id)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const poll_status = async () => {
    const status: AudioStatus = await invoke("current_audio_status")
    console.debug(status)
    setStatus(status)
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    if (audio.duration !== status.current) {
      const timeoutFunction = setInterval(poll_status, 1000)
      return () => {
        clearInterval(timeoutFunction)
      }
    } else if (audio.duration === status.current) {
      setIsPlaying(false)
    }
  }, [poll_status, status])

  useEffect(() => {
    if (isObjectEmpty(audio)) {
      return
    } else if (!isPlaying) {
      play()
    } else {
      pause()
      play()
    }
  }, [audio])

  return (
    <div
      className={cn(
        "sticky bottom-0 w-full bg-slate-50 dark:bg-slate-950 transition-all duration-300 ease-out",
        isObjectEmpty(audio) ? "translate-y-full" : "",
      )}
    >
      <Progress className="w-full" value={(status.current / status.total) * 100} />
      <div className="px-8 py-4">
        <div className="flex justify-start items-center w-full h-full">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={previous}>
              <SkipBack />
            </Button>
            {isPlaying ? (
              <Button variant="ghost" size="icon" onClick={pause}>
                <Pause className="w-8 h-8" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={play}>
                <Play className="w-8 h-8" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={next}>
              <SkipForward />
            </Button>
            <p className="text-sm text-muted-foreground ml-2">
              {format_duration(status.current)} / {format_duration(audio.duration)}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="font-semibold leading-tight">{audio.title}</p>
            <p className="text-sm text-muted-foreground">{audio.artist}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <VolumeButton />
            <Button variant="ghost" size="icon">
              <Repeat />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                shuffle(
                  currentPlaylistListening,
                  router.query.playlist as string,
                  setAudioList,
                  setOldAudioList,
                )
              }
            >
              <Shuffle />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
