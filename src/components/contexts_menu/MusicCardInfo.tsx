import Image from "next/image"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { byteToImage, format_duration } from "@/lib/utils"

import { Audio } from "../types/audio"
import { Label } from "../ui/label"

export function MusicCardInfo({ audio }: { audio: Audio }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p>Information</p>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-800 p-8 rounded-lg">
        <div className="flex items-start space-x-6">
          <Image
            className="rounded-lg object-cover shadow-lg"
            src={byteToImage(audio.cover)}
            height={200}
            width={200}
            alt="Album cover"
            style={{
              aspectRatio: "1/1",
              objectFit: "cover",
              overflow: "visible", // Set overflow to visible
            }}
          />
          <div className="flex flex-col space-y-2">
            <p className="text-xl font-semibold dark:text-white">{audio.title}</p>
            <div>
              <Label className="text-gray-500 dark:text-gray-300">Artist</Label>
              <p className="text-gray-500 dark:text-gray-300">{audio.artist}</p>
            </div>
            <div>
              <Label className="text-gray-500 dark:text-gray-300">Duration</Label>
              <p className="text-gray-400 dark:text-gray-200">
                {format_duration(audio.duration)}
              </p>
            </div>
            <div>
              <Label className="text-gray-500 dark:text-gray-300">Folder path</Label>
              <p className="text-gray-400 dark:text-gray-200">
                {audio.path.substring(0, audio.path.lastIndexOf("/"))}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
