/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { invoke } from "@tauri-apps/api/tauri"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { MusicsGrid } from "@/components/MusicsGrid"
import { PlaylistCarousel } from "@/components/PlaylistCarousel"
import { Audio } from "@/components/types/audio"

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
      <div className="flex flex-row container">
        <MusicsGrid audios={history} />
      </div>
    </div>
  )
}

export default Home
