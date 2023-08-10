/* eslint-disable @next/next/no-img-element */
import { CheckedState } from "@radix-ui/react-checkbox"
import { invoke } from "@tauri-apps/api/tauri"
import * as base64 from "byte-base64"
import { ListPlus } from "lucide-react"
import { useContext, useEffect } from "react"
import { useCallback, useState } from "react"

import { AppContext } from "@/components/AppContext"
import { CreatePlaylist } from "@/components/modals/CreatePlaylist"
import { Audio } from "@/components/types/audio"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { format_duration } from "@/lib/utils"

type PlaylistCheckedState = Record<string, Record<string, boolean>>

const grayb64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8Ww8AAj8BXkQ+xPEAAAAASUVORK5CYII="

function byteToImage(byteArray: number[]) {
  const base64String = byteArray.length > 0 ? base64.bytesToBase64(byteArray) : grayb64
  return `data:image/png;base64,${base64String}`
}

async function isInPlaylist(value: Audio, playlist: string) {
  const res = await invoke<CheckedState>("is_in_playlist", {
    playlist: playlist,
    path: value.path,
  })
  return res
}

export default function Music({ name }: { name: string }) {
  const { setAudioPlayer, audioList, setAudioList } = useContext(AppContext)
  const { playlists, setOldAudioList } = useContext(AppContext)
  const [playlistCheckedState, setPlaylistCheckedState] = useState(
    {} as PlaylistCheckedState,
  )

  const fetchPlaylistCheckedState = useCallback(async () => {
    const playlistCheckedState: PlaylistCheckedState = {}
    for (const playlist of playlists) {
      playlistCheckedState[playlist] = {}
      for (const audio of audioList) {
        const res = await isInPlaylist(audio, playlist)
        playlistCheckedState[playlist][audio.id] = res as boolean
      }
    }
    setPlaylistCheckedState(playlistCheckedState)
  }, [audioList, playlists])

  const setAudiosFromPlaylist = useCallback(
    async (playlist: string) => {
      setOldAudioList(audioList)
      const res = await invoke<Audio[]>("get_audio_playlist", {
        playlist: playlist,
      })
      setAudioList(res)
    },
    [audioList, setAudioList, setOldAudioList],
  )

  useEffect(() => {
    setAudiosFromPlaylist(name).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    fetchPlaylistCheckedState().catch(console.error)
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
                    <ContextMenuSubTrigger>
                      <ListPlus className="mr-2 h-4 w-4" />
                      Add to playlist
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="p-0">
                      <Command>
                        <CommandInput
                          placeholder="Choose playlist..."
                          autoFocus={true}
                        />
                        <CommandList>
                          <CreatePlaylist />
                          <CommandEmpty>No playlist found.</CommandEmpty>
                          <CommandGroup>
                            {playlists.map((playlist) => (
                              <CommandItem key={playlist}>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={playlist}
                                    defaultChecked={
                                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                      playlistCheckedState[playlist][value.id] ?? false
                                    }
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    onCheckedChange={async (state) => {
                                      await invoke("add_audio_to_playlist", {
                                        state: state,
                                        playlist: playlist,
                                        path: value.path,
                                      })
                                      await fetchPlaylistCheckedState()
                                      if (name === playlist) {
                                        await setAudiosFromPlaylist(playlist)
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor="terms"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {playlist}
                                  </label>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </ContextMenuSubContent>
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
