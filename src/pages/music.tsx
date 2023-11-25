/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { /*Book,*/ PenBox, Shuffle } from "lucide-react"
import Image from "next/image"
import { useContext, useEffect } from "react"
import { List } from "react-virtualized"

import { AppContext } from "@/components/AppContext"
import {
  fetchPlaylistCheckedState,
  setAudiosFromPlaylist,
} from "@/components/contexts_menu/CPlaylistSub"
import { shuffle } from "@/components/player/Player"
import { Button } from "@/components/ui/button"
import MusicCard from "@/components/ui/MusicCard"
import { b64imageWrap, cn, isObjectEmpty } from "@/lib/utils"

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
              {name === "all" ? "Music" : name}
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
      <div className="h-2/4 overflow">
        <div className="container flex flex-col gap-2 items-stretch">
          {/* {context.audioList.map((value, index) => {
            // needs to be lazy loaded
            return <MusicCard key={index} audio={value} context={context} name={name} />
          })} */}
          {/* Not reponsive :( */}
          <List
            width={1200}
            height={500}
            rowCount={context.audioList.length}
            rowHeight={100}
            rowRenderer={rowRenderer}
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function rowRenderer({ key, style }: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unused-vars
    const index = key.split("-")[0]
    return (
      <div key={index} style={style}>
        <MusicCard audio={context.audioList[index]} context={context} name={name} />
      </div>
    )
  }
}
