import "@egjs/react-flicking/dist/flicking.css"

import Flicking from "@egjs/react-flicking"
import Image from "next/image"
import Router from "next/router"
import { useRef } from "react"

import { byteToImage } from "@/lib/utils"

import { CarouselControls } from "./CarouselControls"
import { Playlist } from "./types/playlist"

export const PlaylistCarousel = ({
  playlists,
  title,
}: {
  playlists: Playlist[]
  title: string
}) => {
  const flickingRef = useRef<Flicking>(null)
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <div className="flex justify-between items-center gap-2">
        <p className="text-lg font-medium tracking-tight lg:text-xl">{title}</p>
        <CarouselControls flickerRef={flickingRef} />
      </div>
      <Flicking
        ref={flickingRef}
        renderOnlyVisible={true}
        align="prev"
        circular={true}
        useResizeObserver={true}
        useFractionalSize={true}
      >
        {playlists.length !== 0 ? (
          playlists.map((value, index) => {
            return (
              <div className="panel" key={index}>
                <PlaylistCard
                  key={index}
                  playlist={value}
                  onClick={() => {
                    void Router.push({
                      pathname: "/playlist",
                      query: { playlist: value.name },
                    })
                  }}
                />
              </div>
            )
          })
        ) : (
          <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
            No playlist found
          </p>
        )}
      </Flicking>
    </div>
  )
}

export function PlaylistCard({
  playlist,
  onClick,
}: {
  playlist: Playlist
  onClick: () => void
}) {
  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onClick}
      id={`playlist-${playlist.name}`}
      className="panel shrink-0 flex flex-col gap-4 items-center justify-start cursor-pointer hover:bg-gray-50 duration-150
              delay-90 dark:hover:bg-gray-900 p-4 rounded-lg transition ease-in-out"
    >
      <Image
        src={byteToImage(playlist.cover)}
        //style={{ filter: "hue-rotate(100deg)" }}
        className={`aspect-square rounded-lg ${
          playlist.cover.length === 0
            ? "dark:invert dark:relative mix-blend-mode-overlay"
            : ""
        }`}
        height={208}
        width={208}
        alt={playlist.name}
      />
      <div className="flex flex-col w-full px-1">
        <h2 className="text-left text-sm font-medium truncate">{playlist.name}</h2>
        <p className="text-left text-xs truncate text-slate-600 dark:text-slate-400">
          {playlist.count} songs
        </p>
      </div>
    </button>
  )
}
