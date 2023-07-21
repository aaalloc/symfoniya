import { invoke } from "@tauri-apps/api"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { Volume2 } from "lucide-react"

export default function VolumeButton() {

    const set_volume = async (volume: number[]) => {
        await invoke("set_volume", { volume: volume[0] / 100 })
        return volume
    }

    return <Popover>
        <PopoverTrigger>
            <Button variant="ghost" size="icon">
                <Volume2 />
            </Button>
        </PopoverTrigger>
        <PopoverContent>
            <Slider defaultValue={[100]} max={100} step={1} onValueChange={(value) => set_volume(value)} />
        </PopoverContent>
    </Popover>

}