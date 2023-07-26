import { invoke } from "@tauri-apps/api/tauri"
import { Volume2 } from "lucide-react"
import { useState } from "react"

import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Slider } from "./ui/slider"

export default function VolumeButton() {
  const [volume, setVolume] = useState([100])
  const set_volume = async (volume: number[]) => {
    await invoke("set_volume", { volume: volume[0] / 100 })
    setVolume(volume)
    return volume
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon">
          <Volume2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Slider
          defaultValue={volume}
          max={100}
          step={1}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onValueChange={(value) => set_volume(value)}
        />
      </PopoverContent>
    </Popover>
  )
}
