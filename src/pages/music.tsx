/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @next/next/no-img-element */
import { invoke } from "@tauri-apps/api/tauri"
import { PenBox, Shuffle } from "lucide-react"
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
import { byteToImage, cn, format_duration, isObjectEmpty } from "@/lib/utils"

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

  return (
    <div className="h-full flex flex-col gap-10">
      <div className="flex flex-row container gap-x-12">
        <img
          className="h-56 w-56 object-cover rounded-lg"
          src={
            isObjectEmpty(context.audioList)
              ? byteToImage([] as number[])
              : byteToImage(context.audioList[0].cover)
          }
          alt="playlist"
        />
        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-row gap-6">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              {name === "all" ? "Music" : name}
            </h1>
            <Button variant="ghost" size="icon">
              <PenBox className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground mb-2">
            {context.audioList.length ?? 0} songs
          </p>
          <Button
            className={cn(
              "w-28 h-50",
              context.audioList.length === 0 ? "cursor-not-allowed" : "",
            )}
            variant="outline"
            disabled={context.audioList.length === 0}
            onClick={() => shuffle(name, context, true)}
          >
            <Shuffle className="mr-2 h-5 w-5" /> Shuffle
          </Button>
        </div>
      </div>
      {/* 2/4 */}
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
                    className="hover:cursor-pointer p-4 rounded-lg transition ease-in-out delay-90 dark:hover:bg-gray-900 hover:bg-gray-50 duration-150 flex items-center space-x-8"
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
  //console.log(playlistCheckedState)
}
