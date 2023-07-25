import { Progress } from "@/components/ui/progress"
import { Audio } from "@/components/types/audio"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"
import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { Button } from "./ui/button"
import VolumeButton from "./Volume"
import { cn } from "@/lib/utils"
import { log } from "console"

type AudioStatus = {
    status: string
    current_time: number
    duration: number
}

function isObjectEmpty(objectName: any) {
    return Object.keys(objectName).length === 0
}

function format_duration(duration: number) {
    let minutes: any = Math.floor(duration / 60)
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let seconds: any = Math.floor(duration % 60)
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    return `${minutes}:${seconds}`
}

export function Player(props: { currentAudio: Audio, setter: Function, audioList: Audio[] }) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [status, setStatus] = useState({ current_time: 0 } as AudioStatus)

    const play = async () => {
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
        props.setter(props.audioList[id])
    }

    const previous = async () => {
        const id: number = await invoke("goto_previous")
        await invoke("play_from_id", { id: id })
        props.setter(props.audioList[id])
    }

    const poll_status = async () => {
        const tmp: any = await invoke("current_audio_status");
        const status: AudioStatus = {
            status: tmp[0],
            current_time: tmp[1],
            duration: tmp[2]
        }
        console.log(status);
        setStatus(status);
    }

    useEffect(() => {
        if (!isPlaying) {
            return
        }
        if (props.currentAudio.duration != status.current_time) {
            const timeoutFunction = setInterval(poll_status, 1000)
            return () => clearInterval(timeoutFunction)
        }
    }, [poll_status, status])

    useEffect(() => {
        if (isObjectEmpty(props.currentAudio)) {
            return
        }
        if (!isPlaying) {
            play()
        } else {
            pause()
            play()
        }
    }, [props.currentAudio])

    return (
        <div className={cn(
            "sticky bottom-0 w-full bg-slate-50 dark:bg-slate-950 transition-all duration-300 ease-out",
            isObjectEmpty(props.currentAudio) ? 'translate-y-full' : '')}>
            <Progress className="w-full" value={(status.current_time / status.duration) * 100} />
            <div className="px-8 py-4">

                <div className="flex justify-start items-center w-full h-full">

                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={previous}>
                            <SkipBack />
                        </Button>
                        {
                            isPlaying ?
                                <Button variant="ghost" size="icon" onClick={pause}>
                                    <Pause className="w-8 h-8" />
                                </Button> :
                                <Button variant="ghost" size="icon" onClick={play}>
                                    <Play className="w-8 h-8" />
                                </Button>
                        }
                        <Button variant="ghost" size="icon" onClick={next}>
                            <SkipForward />
                        </Button>

                        <p className="text-sm text-muted-foreground ml-2">{format_duration(status.current_time)} / {format_duration(props.currentAudio.duration)}</p>

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