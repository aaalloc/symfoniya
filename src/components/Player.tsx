import { Progress } from "@/components/ui/progress"
import { Play, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"
export function Player() {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <SkipBack />
            <Play />
            <SkipForward />
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