/* eslint-disable @next/next/no-img-element */
import * as base64 from "byte-base64"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { format_duration } from "@/lib/utils"

const grayb64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8Ww8AAj8BXkQ+xPEAAAAASUVORK5CYII="

function byteToImage(byteArray: number[]) {
  const base64String = byteArray.length > 0 ? base64.bytesToBase64(byteArray) : grayb64
  return `data:image/png;base64,${base64String}`
}

export default function Music() {
  const { setAudioPlayer, audioList } = useContext(AppContext)
  return (
    <div className="h-full flex-1 flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Musics
      </h1>
      <div className="h-3/4 overflow-y-auto">
        <div className="container flex flex-col gap-2 items-stretch">
          {audioList.map((value) => {
            return (
              <div
                key={value.id}
                onClick={() => {
                  setAudioPlayer(value)
                }}
                className="hover:cursor-pointer p-6 rounded-lg transition ease-in-out delay-90 dark:hover:bg-gray-900 hover:bg-gray-50 duration-150 flex items-center space-x-8"
              >
                <div className="flex-shrink-0">
                  <img
                    className="h-14 w-14 rounded-md"
                    src={byteToImage(value.cover)}
                    alt=""
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold">{value.title}</p>
                  <p className="text-sm text-muted-foreground">{value.artist}</p>
                </div>
                <p className="">{format_duration(value.duration)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
