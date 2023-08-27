/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @next/next/no-img-element */
import { invoke } from "@tauri-apps/api/tauri"
import { Shuffle } from "lucide-react"
import { useContext, useEffect } from "react"

import { AppContext } from "@/components/AppContext"
import CPlaylistSub, {
  fetchPlaylistCheckedState,
  setAudiosFromPlaylist,
} from "@/components/contexts_menu/CPlaylistSub"
import { play, shuffle, update_after_play } from "@/components/player/Player"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { byteToImage, format_duration } from "@/lib/utils"

export default function Music({ name }: { name: string }) {
  const context = useContext(AppContext)

  useEffect(() => {
    setAudiosFromPlaylist(name, context.audioList, context.setAudioList).catch(
      console.error,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    fetchPlaylistCheckedState(
      context.playlists,
      context.audioList,
      context.setPlaylistCheckedState,
    ).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.audioList])

  //console.log(playlistCheckedState)
  return (
    <div className="h-full flex-1 flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        {name === "all" ? "Music" : name}
      </h1>
      <Button variant="ghost" size="icon" onClick={() => shuffle(name, context, true)}>
        <Shuffle />
      </Button>
      <div className="h-3/4 overflow-y-auto">
        <div className="container flex flex-col gap-2 items-stretch">
          {context.audioList.map((value) => {
            return (
              <ContextMenu key={value.id}>
                <ContextMenuTrigger>
                  <div
                    key={value.id}
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      await invoke("update_player", {
                        playlist: name,
                      })
                      context.setCurrentPlaylistListening(name)
                      await update_after_play(context, name)
                      await play(context, value, true)
                    }}
                    id={`audio-${value.id}`}
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
                </ContextMenuTrigger>
                <ContextMenuContent className="w-44">
                  <ContextMenuSub>
                    <CPlaylistSub value={value} name={name} />
                  </ContextMenuSub>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </div>
      </div>
    </div>
  )
}
