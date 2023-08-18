/* eslint-disable @next/next/no-img-element */
import { invoke } from "@tauri-apps/api/tauri"
import { useContext, useEffect } from "react"

import { AppContext } from "@/components/AppContext"
import CPlaylistSub, {
  fetchPlaylistCheckedState,
  setAudiosFromPlaylist,
} from "@/components/contexts_menu/CPlaylistSub"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { byteToImage, format_duration } from "@/lib/utils"

export default function Music({ name }: { name: string }) {
  const { setAudioPlayer, audioList, setAudioList } = useContext(AppContext)
  const { playlists, setOldAudioList } = useContext(AppContext)
  const { setPlaylistCheckedState } = useContext(AppContext)
  useEffect(() => {
    setAudiosFromPlaylist(name, audioList, setAudioList, setOldAudioList).catch(
      console.error,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    fetchPlaylistCheckedState(playlists, audioList, setPlaylistCheckedState).catch(
      console.error,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioList])

  //console.log(playlistCheckedState)
  return (
    <div className="h-full flex-1 flex flex-col gap-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
        {name === "all" ? "Music" : name}
      </h1>
      <div className="h-3/4 overflow-y-auto">
        <div className="container flex flex-col gap-2 items-stretch">
          {audioList.map((value) => {
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
                      setAudioPlayer(value)
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
