/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { invoke } from "@tauri-apps/api/tauri"
import { /*Book,*/ PenBox, Shuffle } from "lucide-react"
import Image from "next/image"
import { useContext, useEffect } from "react"

import { AppContext, appContext } from "@/components/AppContext"
import CPlaylistSub, {
  fetchPlaylistCheckedState,
  setAudiosFromPlaylist,
} from "@/components/contexts_menu/CPlaylistSub"
import { MusicCardInfo } from "@/components/contexts_menu/MusicCardInfo"
import { play, shuffle, update_after_play } from "@/components/player/Player"
import { Audio } from "@/components/types/audio"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { b64imageWrap, cn, format_duration, isObjectEmpty } from "@/lib/utils"

export const MusicCard = ({
  audio,
  context,
  name,
}: {
  audio: Audio
  context: appContext
  name: string
}) => {
  return (
    <ContextMenu key={audio.id}>
      <ContextMenuTrigger>
        <div
          key={audio.id}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/require-await
          onClick={async () => {
            if (name === "recent") {
              return // TODO
            }
            await invoke("update_player", {
              playlist: name,
            })
            context.setCurrentPlaylistListening(name)
            await update_after_play(context, name, true)
            await play(context, audio, true)
          }}
          id={`audio-${audio.id}`}
          className="hover:cursor-pointer p-4 rounded-lg transition ease-in-out delay-90 dark:hover:bg-gray-900 hover:bg-gray-50 duration-150 flex items-center space-x-8 w-full"
        >
          <div className="shrink-0">
            <Image
              className="rounded-md"
              src={b64imageWrap(audio.cover)}
              height={56}
              width={56}
              alt=""
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold truncate">{audio.title}</p>
            <p className="text-sm text-muted-foreground">{audio.artist}</p>
          </div>
          <p className="">{format_duration(audio.duration)}</p>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuSub>
          <CPlaylistSub value={audio} name={name} />
        </ContextMenuSub>
        <ContextMenuItem
          onClick={(event) => {
            event.preventDefault()
          }}
        >
          <MusicCardInfo audio={audio} />
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default function Music({ name }: { name: string }) {
  const context = useContext(AppContext)

  useEffect(() => {
    setAudiosFromPlaylist(name, context.setAudioList)
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
        <Image
          className="object-cover rounded-lg"
          src={
            isObjectEmpty(context.audioList)
              ? b64imageWrap("" as string)
              : b64imageWrap(context.audioList[0].cover)
          }
          alt="playlist"
          height={224}
          width={224}
        />
        <div className="flex flex-col justify-center gap-2">
          <div className="flex flex-row gap-6">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              {name === "all" ? "Musics" : name}
            </h1>
            {name !== "all" ? (
              <Button variant="ghost" size="icon">
                <PenBox className="h-6 w-6" />
              </Button>
            ) : (
              ""
            )}
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
      <div className="h-2/4 overflow-y-auto">
        <div className="container flex flex-col gap-2 items-stretch">
          {context.audioList.map((value, index) => {
            return <MusicCard key={index} audio={value} context={context} name={name} />
          })}
        </div>
      </div>
    </div>
  )
  //console.log(playlistCheckedState)
}
