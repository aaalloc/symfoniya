/* eslint-disable @next/next/no-img-element */
import "@egjs/react-flicking/dist/flicking.css"

import Flicking from "@egjs/react-flicking"
import Router from "next/router"
import { useRef } from "react"

import { byteToImage } from "@/lib/utils"

import { PlaylistCarouselControls } from "./PlaylistCarouselControls"
import { Playlist } from "./types/playlist"

export const PlaylistCarousel = ({
  playlists,
  title,
}: {
  playlists: Playlist[]
  title: string
}) => {
  const flickingRef: React.MutableRefObject<Flicking | null> = useRef(null)
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex justify-between items-center gap-2">
        <p className="text-lg font-medium tracking-tight lg:text-xl">{title}</p>
        <PlaylistCarouselControls flickerRef={flickingRef} />
      </div>
      <div className="overflow-x-auto flex flex-row ">
        <Flicking
          ref={flickingRef}
          renderOnlyVisible={true}
          align="prev"
          circular={true}
          horizontal={true}
        >
          {playlists.length !== 0 ? (
            playlists.map((value, index) => {
              return (
                <button
                  key={index}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() => {
                    void Router.push({
                      pathname: "/playlist",
                      query: { playlist: value.name },
                    })
                  }}
                  id={`playlist-${value.name}`}
                  className="panel shrink-0 flex flex-col gap-4 items-center justify-start cursor-pointer hover:bg-gray-50 duration-150
              delay-90 dark:hover:bg-gray-900 p-4 rounded-lg transition ease-in-out"
                >
                  <img
                    src={byteToImage(value.cover)}
                    //style={{ filter: "hue-rotate(100deg)" }}
                    className={`h-52 w-52 aspect-square rounded-lg ${
                      value.cover.length === 0
                        ? "dark:invert dark:relative mix-blend-mode-overlay"
                        : ""
                    }`}
                    alt={value.name}
                  />
                  <div className="flex flex-col w-full px-1">
                    <h2 className="text-left text-sm font-medium truncate">
                      {value.name}
                    </h2>
                    <p className="text-left text-xs truncate text-slate-600 dark:text-slate-400">
                      {value.count} songs
                    </p>
                  </div>
                </button>
              )
            })
          ) : (
            <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
              No playlist found
            </p>
          )}
        </Flicking>
      </div>
    </div>
  )
}
