import { Progress } from "@/components/ui/progress"
import { Audio } from "@/components/scene/Music"
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"
import { useEffect } from "react"



export function Player(props: { currentAudio: Audio, setter: Function }) {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <SkipBack />
            <Play />
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