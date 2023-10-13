/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import "@egjs/react-flicking/dist/flicking.css"

import Flicking from "@egjs/react-flicking"
import { invoke } from "@tauri-apps/api/tauri"
import type { NextPage } from "next"
import { useEffect, useRef, useState } from "react"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { PlaylistCarousel } from "@/components/PlaylistCarousel"
import { Audio } from "@/components/types/audio"

import { MusicCard } from "./music"

const Home: NextPage = () => {
  const [history, setHistory] = useState<Audio[]>([])
  const context = useContext(AppContext)

  useEffect(() => {
    void (async () => {
      const res = await invoke<Audio[]>("import_audios_history")
      setHistory(res)
    })()
  }, [])

  useEffect(() => {
    void (async () => {
      const res = await invoke<Audio[]>("get_audios_history")
      setHistory(res)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.audio])
  const flickingRef = useRef<Flicking>(null)
  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Hello !
      </h1>
      <div className="flex flex-row container">
        <PlaylistCarousel title="Your latest playlists" playlists={context.playlists} />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Listen again
      </h1>
      <div className="h-[23%] flex flex-col container">
        <div className="grid grid-cols-2 overflow-y-auto justify-between">
          {history !== null ? (
            history.map((value, index) => {
              return (
                <div className="panel" key={index}>
                  <MusicCard audio={value} context={context} name="recent" />
                </div>
              )
            })
          ) : (
            <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
              No history found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
