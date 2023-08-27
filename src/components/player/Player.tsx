/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { invoke } from "@tauri-apps/api/tauri"
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useContext } from "react"

import { AppContext, appContext } from "@/components/AppContext"
import { Audio, AudioStatus } from "@/components/types/audio"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { format_duration, isObjectEmpty } from "@/lib/utils"

import { Button } from "../ui/button"
import VolumeButton from "./Volume"

async function play_from_id_or_skip(
  id: number,
  context: appContext,
  fromMusicPage = false,
) {
  const { toast } = context
  const { audio, audioList, oldAudioList } = context
  const { setAudioList, setOldAudioList } = context
  const result: boolean = await invoke("play_from_id", {
    id: id,
    path: fromMusicPage ? audioList[id].path : oldAudioList[id].path,
  })
  if (!result) {
    setAudioList(audioList.filter((audio) => audio.id !== id))
    setOldAudioList(oldAudioList.filter((audio) => audio.id !== id))
    toast({
      title: "Audio",
      description: `${audio.title} is deleted, skipping to next audio`,
    })
    return false
  }
  return true
}

export async function update_after_play(context: appContext, playlistListening = "") {
  const { currentPlaylistListening, setOldAudioList } = context
  await invoke("update_player", {
    playlist: playlistListening || currentPlaylistListening,
  })
  const res = await invoke<Audio[]>("get_audio_playlist", {
    playlist: playlistListening || currentPlaylistListening,
  })
  setOldAudioList(res)
}

async function next(context: appContext) {
  const { setAudioById } = context
  await update_after_play(context)
  const id: number = await invoke("goto_next")
  const result = await play_from_id_or_skip(id, context)
  if (result) {
    setAudioById(id)
  }
}

export async function play(context: appContext, toPlay: Audio, fromMusicPage = false) {
  const { isPlaying, setIsPlaying, setAudioPlayer } = context
  const { status } = context
  if (status.current === toPlay.duration) {
    console.log("resetting current")
    status.current = 0
  }
  const result = await play_from_id_or_skip(toPlay.id, context, fromMusicPage)
  if (result && !isPlaying) {
    setIsPlaying(true)
    setAudioPlayer(toPlay)
  } else if (result && isPlaying) {
    setAudioPlayer(toPlay)
  } else {
    next(context)
  }
}

async function pause(context: appContext) {
  const { setIsPlaying } = context
  await invoke("pause")
  setIsPlaying(false)
}

async function previous(context: appContext) {
  const { setAudioById } = context
  await update_after_play(context)
  const id: number = await invoke("goto_previous")
  const result = await play_from_id_or_skip(id, context)
  if (result) {
    setAudioById(id)
  }
}

export async function shuffle(
  name: string,
  context: appContext,
  fromMusicPage = false,
) {
  const {
    setAudioList,
    setOldAudioList,
    setCurrentPlaylistListening,
    currentPlaylistListening,
  } = context
  const { audio, setAudioPlayer } = context
  const audios: Audio[] = await invoke("shuffle", {
    playlist: fromMusicPage ? name : currentPlaylistListening,
  })

  if (fromMusicPage) {
    setAudioList(audios)
    setOldAudioList(audios)
  } else if (name === currentPlaylistListening) {
    setAudioList(audios)
  } else {
    setOldAudioList(audios)
  }
  await update_after_play(context)
  const result = await play_from_id_or_skip(audios[0].id, context)
  if (result) {
    if (audios[0] === audio) {
      return
    }
    setAudioPlayer(audios[0])
    if (fromMusicPage) {
      setCurrentPlaylistListening(name)
    }
  }
}

export function Player() {
  const router = useRouter()
  const context = useContext(AppContext)
  const { isPlaying, setIsPlaying } = useContext(AppContext)
  const { setStatus, status } = useContext(AppContext)
  const { audio } = useContext(AppContext)
  const poll_status = async () => {
    const status: AudioStatus = await invoke("current_audio_status")
    console.debug(status)
    setStatus(status)
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }
    const timeoutFunction = setInterval(poll_status, 1000)
    if (audio.duration === status.current) {
      setIsPlaying(false)
    }
    return () => {
      clearInterval(timeoutFunction)
    }
  }, [poll_status, status])

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
            <Button variant="ghost" size="icon" onClick={() => previous(context)}>
              <SkipBack />
            </Button>
            {isPlaying ? (
              <Button variant="ghost" size="icon" onClick={() => pause(context)}>
                <Pause className="w-8 h-8" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => play(context, audio)}>
                <Play className="w-8 h-8" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => next(context)}>
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
              onClick={() => shuffle(router.query.playlist as string, context)}
            >
              <Shuffle />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
