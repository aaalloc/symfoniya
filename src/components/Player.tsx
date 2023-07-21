import { Progress } from "@/components/ui/progress"
import { Audio } from "@/components/scene/Music"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"
import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { Button } from "./ui/button"
import { Slider } from "@/components/ui/slider"

type AudioStatus = {
    status: string
    current_time: number
    duration: number
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

export function Player(props: { currentAudio: Audio, setter: Function }) {
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

    const set_volume = async (volume: number[]) => {
        await invoke("set_volume", { volume: volume[0] / 100 })
        console.log(volume)
        return volume
    }

    const poll_status = async () => {
        const tmp: any = await invoke("current_audio_status");
        const status: AudioStatus = {
            status: tmp[0],
            current_time: tmp[1],
            duration: tmp[2]
        }
        setStatus(status);
        console.log(status);
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
    return (
        <div className="sticky bottom-0 w-full bg-slate-50 dark:bg-slate-950">
            <Progress className="w-full" value={(status.current_time / status.duration) * 100} />
            <div className="container py-4">

                <div className="flex justify-start items-center w-full h-full">

                    <div className="flex gap-2 items-center">
                        <Button variant="ghost" size="icon">
                            <SkipBack />
                        </Button>
                        {
                            isPlaying ?
                                <Button variant="ghost" size="icon" onClick={pause}>
                                    <Pause />
                                </Button> :
                                <Button variant="ghost" size="icon" onClick={play}>
                                    <Play />
                                </Button>
                        }
                        <Button variant="ghost" size="icon">
                            <SkipForward />
                        </Button>

                        <p className="text-sm text-muted-foreground ml-2">{format_duration(status.current_time)} / {format_duration(props.currentAudio.duration)}</p>

                    </div>

                    <div className="flex flex-col items-center justify-center flex-1">
                        <p className="font-semibold leading-tight">{props.currentAudio.title}</p>
                        <p className="text-sm text-muted-foreground">{props.currentAudio.artist}</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <Volume2 className="w-8 h-8" />
                        <Slider defaultValue={[100]} max={100} step={1} onValueChange={(value) => set_volume(value)} />
                        <Repeat className="w-8 h-8" />
                        <Shuffle className="w-8 h-8" />
                    </div>

                </div>
            </div>
        </div>
    )
}