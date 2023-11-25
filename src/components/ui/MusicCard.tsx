/* eslint-disable prettier/prettier */
import { invoke } from "@tauri-apps/api/tauri"
import Image from "next/image"

import { appContext } from "@/components/AppContext"
import { MusicCardInfo } from "@/components/contexts_menu/MusicCardInfo"
import { play, update_after_play } from "@/components/player/Player"
import { Audio } from "@/components/types/audio"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { b64imageWrap, format_duration } from "@/lib/utils"

import CPlaylistSub from "../contexts_menu/CPlaylistSub"




export default function MusicCard({
    audio,
    context,
    name,
}: {
    audio: Audio
    context: appContext
    name: string
}) {
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
