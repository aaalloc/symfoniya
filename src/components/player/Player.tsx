/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { invoke } from "@tauri-apps/api/tauri"
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react"
import { useEffect, useState } from "react"

import { Audio } from "@/components/types/audio"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { format_duration } from "@/lib/utils"

import { Button } from "../ui/button"
import VolumeButton from "./Volume"

interface AudioStatus {
  status: string
  current_time: number
  duration: number
}

function isObjectEmpty(objectName: object) {
  return Object.keys(objectName).length === 0
}
export function Player(props: { currentAudio: Audio; setter: (id: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState({ current_time: 0 } as AudioStatus)

  const play = async () => {
    if (status.current_time === props.currentAudio.duration) {
      status.current_time = 0
      //props.setter(props.currentAudio.id)
    }
    await invoke("play_from_id", { id: props.currentAudio.id })
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
    props.setter(id)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const previous = async () => {
    const id: number = await invoke("goto_previous")
    await invoke("play_from_id", { id: id })
    props.setter(id)
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const poll_status = async () => {
    const tmp: any = await invoke("current_audio_status")
    const status: AudioStatus = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      status: tmp[0],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      current_time: tmp[1],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      duration: tmp[2],
    }
    console.debug(status)
    setStatus(status)
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    if (props.currentAudio.duration !== status.current_time) {
      const timeoutFunction = setInterval(poll_status, 1000)
      return () => {
        clearInterval(timeoutFunction)
      }
    } else if (props.currentAudio.duration === status.current_time) {
      setIsPlaying(false)
    }
  }, [poll_status, status])

  useEffect(() => {
    if (isObjectEmpty(props.currentAudio)) {
      return
    } else if (!isPlaying) {
      play()
    } else {
      pause()
      play()
    }
  }, [props.currentAudio])

  return (
    <div
      className={cn(
        "sticky bottom-0 w-full bg-slate-50 dark:bg-slate-950 transition-all duration-300 ease-out",
        isObjectEmpty(props.currentAudio) ? "translate-y-full" : "",
      )}
    >
      <Progress
        className="w-full"
        value={(status.current_time / status.duration) * 100}
      />
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
              {format_duration(status.current_time)} /{" "}
              {format_duration(props.currentAudio.duration)}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="font-semibold leading-tight">{props.currentAudio.title}</p>
            <p className="text-sm text-muted-foreground">{props.currentAudio.artist}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <VolumeButton />
            <Button variant="ghost" size="icon">
              <Repeat />
            </Button>
            <Button variant="ghost" size="icon">
              <Shuffle />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
