/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @next/next/no-img-element */
import { invoke } from "@tauri-apps/api/tauri"
import type { NextPage } from "next"
import Router from "next/router"
import { useEffect, useState } from "react"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { Audio } from "@/components/types/audio"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"
import { byteToImage } from "@/lib/utils"

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
      <div className="overflow-x-auto flex flex-row container mx-auto px-16">
        {context.playlists.length !== 0 ? (
          context.playlists.map((value, index) => {
            return (
              <div
                key={index}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => {
                  void Router.push({
                    pathname: "/playlist",
                    query: { playlist: value.name },
                  })
                }}
                id={`playlist-${value.name}`}
                className="shrink-0
                hover:cursor-pointer hover:bg-gray-50 duration-150
                delay-90 dark:hover:bg-gray-900 p-6 rounded-lg transition ease-in-out  items-center space-y-4"
              >
                <img
                  src={byteToImage(value.cover)}
                  className="h-52 w-52 rounded-lg"
                  alt={value.name}
                />
                <div>
                  <h2 className="text-left text-sm font-medium truncate">
                    {value.name}
                  </h2>
                  <p className="text-left text-xs truncate text-slate-600 dark:text-slate-400">
                    {value.count} songs
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
            No playlist found
          </p>
        )}
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        Listen again
      </h1>
      <div className="h-2/6 overflow-y-auto grid grid-cols-2 container">
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
  )
}

export default Home
