import { CheckedState } from "@radix-ui/react-checkbox"
import { invoke } from "@tauri-apps/api/tauri"
import { ListPlus } from "lucide-react"
import { useContext } from "react"

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
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"

type PlaylistCheckedState = Record<string, Record<string, boolean>>

export async function isInPlaylist(value: Audio, playlist: string) {
  const res = await invoke<CheckedState>("is_in_playlist", {
    playlist: playlist,
    path: value.path,
  })
  return res
}

export async function fetchPlaylistCheckedState(
  playlists: string[],
  audioList: Audio[],
  setPlaylistCheckedState: (playlistCheckedState: PlaylistCheckedState) => void,
) {
  const playlistCheckedState: PlaylistCheckedState = {}
  for (const playlist of playlists) {
    playlistCheckedState[playlist] = {}
    for (const audio of audioList) {
      const res = await isInPlaylist(audio, playlist)
      playlistCheckedState[playlist][audio.id] = res as boolean
    }
  }
  setPlaylistCheckedState(playlistCheckedState)
}

export async function setAudiosFromPlaylist(
  playlist: string,
  audioList: Audio[],
  setAudioList: (audioList: Audio[]) => void,
  setOldAudioList: (audioList: Audio[]) => void,
) {
  setOldAudioList(audioList)
  const res = await invoke<Audio[]>("get_audio_playlist", {
    playlist: playlist,
  })
  setAudioList(res)
}

function PlaylistCommandItem(props: { playlist: string; value: Audio; name: string }) {
  const { audioList, setAudioList } = useContext(AppContext)
  const { playlists, setOldAudioList } = useContext(AppContext)
  const { playlistCheckedState, setPlaylistCheckedState } = useContext(AppContext)
  return (
    <CommandItem key={props.playlist}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={props.playlist}
          defaultChecked={
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (playlistCheckedState[props.playlist] &&
              playlistCheckedState[props.playlist][props.value.id]) ??
            false
          }
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onCheckedChange={async (state) => {
            await invoke("add_audio_to_playlist", {
              state: state,
              playlist: props.playlist,
              path: props.value.path,
            })
            // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/no-floating-promises
            fetchPlaylistCheckedState(playlists, audioList, setPlaylistCheckedState)
            if (props.name === props.playlist) {
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              setAudiosFromPlaylist(
                props.playlist,
                audioList,
                setAudioList,
                setOldAudioList,
              )
            }
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {props.playlist}
        </label>
      </div>
    </CommandItem>
  )
}

export default function CPlaylistSub({ value, name }: { value: Audio; name: string }) {
  const { playlists } = useContext(AppContext)
  return (
    <>
      <ContextMenuSubTrigger>
        <ListPlus className="mr-2 h-4 w-4" />
        Add to playlist
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="p-0">
        <Command>
          <CommandInput placeholder="Choose playlist..." autoFocus={true} />
          <CommandList>
            <CreatePlaylist />
            <CommandEmpty>No playlist found.</CommandEmpty>
            <CommandGroup>
              {playlists.map((playlist) => (
                <PlaylistCommandItem
                  key={playlist}
                  value={value}
                  name={name}
                  playlist={playlist}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ContextMenuSubContent>
    </>
  )
}
