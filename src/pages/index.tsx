/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @next/next/no-img-element */
import { invoke } from "@tauri-apps/api/tauri"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { PlaylistCarousel } from "@/components/PlaylistCarousel"
import { Audio } from "@/components/types/audio"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

import { MusicCard } from "./music"

const Home: NextPage = () => {
  const [history, setHistory] = useState<Audio[]>([])
  const context = useContext(AppContext)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  useGlobalShortcut("CommandOrControl+O", () => {
    console.log("eeeee")
    invoke("speed_up")
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  })

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

  return (
    <div className="h-full flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Hello !
      </h1>
      <div className="flex flex-row container mx-auto">
        <PlaylistCarousel title="Your latest playlists" playlists={context.playlists} />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Listen again
      </h1>
      <div className="h-2/6 flex flex-col container">
        <div className="grid grid-cols-2 overflow-y-auto justify-between">
          {history !== null ? (
            history.map((value) => {
              return MusicCard(value, context, "recent")
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
