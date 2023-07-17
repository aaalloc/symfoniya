import { Progress } from "@/components/ui/progress"
import { Audio } from "@/components/scene/Music"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"
import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/tauri"
import { Button } from "./ui/button"



export function Player(props: { currentAudio: Audio, setter: Function }) {
    const [isPlaying, setIsPlaying] = useState(false)

    const play = async () => {
        await invoke("play_from_id", { id: props.currentAudio.id })
        setIsPlaying(true)
    }
    const pause = async () => {
        await invoke("pause")
        setIsPlaying(false)
    }


    return (
        <div className="flex items-center justify-center w-full h-full">
            <SkipBack />
            {isPlaying ?
                <Button variant="ghost" size="icon" onClick={pause}>
                    <Pause />
                </Button> :
                <Button variant="ghost" size="icon" onClick={play}>
                    <Play />
                </Button>}
            <SkipForward />
            <h1>{props.currentAudio.title}</h1>
            <h2>{props.currentAudio.artist}</h2>
            <p>{props.currentAudio.duration}</p>
            {/* <Progress /> 
            <div className="flex items-center justify-center w-full">
                <Volume2 className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-center w-full">
                <Repeat className="w-8 h-8" />
                <Shuffle className="w-8 h-8" />
            </div>
            */}
        </div>
    )
}