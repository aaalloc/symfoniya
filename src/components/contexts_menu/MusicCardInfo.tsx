import Image from "next/image"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { b64imageWrap, format_duration } from "@/lib/utils"

import { Audio } from "../types/audio"
import { Label } from "../ui/label"

export function MusicCardInfo({ audio }: { audio: Audio }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p>Information</p>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-gray-800 p-8 rounded-lg flex items-start gap-6 max-w-2xl">
        <Image
          className="rounded-lg object-cover shadow-lg aspect-square"
          src={b64imageWrap(audio.cover)}
          height={200}
          width={200}
          alt="Album cover"
        />
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-xl font-semibold dark:text-white break-all line-clamp-1">
            {audio.title}
          </p>
          <div>
            <Label className="text-gray-500 dark:text-gray-300">Artist</Label>
            <p className="text-gray-500 dark:text-gray-300 break-all line-clamp-1">
              {audio.artist}
            </p>
          </div>
          <div>
            <Label className="text-gray-500 dark:text-gray-300">Duration</Label>
            <p className="text-gray-400 dark:text-gray-200">
              {format_duration(audio.duration)}
            </p>
          </div>
          <div>
            <Label className="text-gray-500 dark:text-gray-300">Folder path</Label>
            <p className="text-gray-400 dark:text-gray-200 break-all line-clamp-1">
              {audio.path.replace(/[/\\][^/\\]*$/, "")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
