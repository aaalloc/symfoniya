import { invoke } from "@tauri-apps/api/tauri"
import { Action, useRegisterActions } from "kbar"
import { ListMusic } from "lucide-react"
import Router, { useRouter } from "next/router"
import { createContext, useEffect, useState } from "react"

import { Audio, AudioStatus } from "@/components/types/audio"
import { Playlist } from "@/components/types/playlist"
import { Toast, ToasterToast, useToast } from "@/components/ui/use-toast"
import { isObjectEmpty } from "@/lib/utils"

type PlaylistCheckedState = Record<string, Record<string, boolean>>

const AppContext = createContext({
  audio: {} as Audio,
  setAudioPlayer: {} as (audio: Audio) => void,
  status: {} as AudioStatus,
  setStatus: {} as (status: AudioStatus) => void,
  audioList: [] as Audio[],
  setAudioList: {} as (audioList: Audio[]) => void,
  oldAudioList: [] as Audio[],
  currentPlaylistListening: "",
  setCurrentPlaylistListening: {} as (playlist: string) => void,
  setOldAudioList: {} as (audioList: Audio[]) => void,
  playlists: [] as Playlist[],
  setPlaylist: {} as (playlist: Playlist[]) => void,
  playlistCheckedState: {} as PlaylistCheckedState,
  setPlaylistCheckedState: {} as (playlistCheckedState: PlaylistCheckedState) => void,
  setAudioById: {} as (id: number) => void,
  isPlaying: false,
  setIsPlaying: {} as (isPlaying: boolean) => void,
  toast: {} as ({ ...props }: Toast) => {
    id: string
    dismiss: () => void
    update: (props: ToasterToast) => void
  },
})

interface appContext {
  audio: Audio
  setAudioPlayer: (audio: Audio) => void
  status: AudioStatus
  setStatus: (status: AudioStatus) => void
  audioList: Audio[]
  setAudioList: (audioList: Audio[]) => void
  oldAudioList: Audio[]
  setOldAudioList: (audioList: Audio[]) => void
  playlists: Playlist[]
  setPlaylist: (playlist: Playlist[]) => void
  playlistCheckedState: PlaylistCheckedState
  setPlaylistCheckedState: (playlistCheckedState: PlaylistCheckedState) => void
  currentPlaylistListening: string
  setCurrentPlaylistListening: (playlist: string) => void
  setAudioById: (id: number) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  toast: ({ ...props }: Toast) => {
    id: string
    dismiss: () => void
    update: (props: ToasterToast) => void
  }
}

export type { appContext }

function usePlaylistsKBarFill(playlists: Playlist[]) {
  const to_add: Action[] = []
  playlists.map((playlist) => {
    to_add.push({
      id: `playlist-${playlist.name}`,
      name: playlist.name,
      keywords: playlist.name,
      perform: () => {
        void Router.push({
          pathname: "/playlist",
          query: { playlist: playlist.name },
        })
      },
      section: "Playlists",
      icon: <ListMusic />,
      priority: 2,
    })
  })
  return to_add
}

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
  const router = useRouter()
  const { toast } = useToast()
  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  const [oldAudioList, setOldAudioList] = useState<Audio[]>([] as Audio[])
  const [playlists, setPlaylist] = useState<Playlist[]>([] as Playlist[])

  const [playlistCheckedState, setPlaylistCheckedState] = useState(
    {} as PlaylistCheckedState,
  )
  const [currentPlaylistListening, setCurrentPlaylistListening] = useState<string>(
    {} as string,
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState({ current: 0 } as AudioStatus)
  const setAudioById = (id: number) => {
    const playlistPage = router.query.playlist as string
    if (currentPlaylistListening === playlistPage) {
      setAudioPlayer(audioList[id])
    } else if (isObjectEmpty(currentPlaylistListening as unknown as object)) {
      setAudioPlayer(audioList[id])
    } else {
      setAudioPlayer(oldAudioList[id])
    }
  }

  const log = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const log_console = await import("tauri-plugin-log-api")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await log_console.attachConsole()
  }

  useEffect(() => {
    // need to a better way to do this
    log().catch((error) => {
      console.error(error)
    })
  }, [])

  useEffect(() => {
    invoke<number>("startup_audios_init")
      .then((response) => {
        if (response === 0) {
          return
        }
      })
      .catch((error) => {
        console.error(error)
      })
    invoke<Playlist[]>("get_playlists")
      .then((response) => {
        console.log(response)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (response === null) {
          return
        }
        setPlaylist(response)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])
  // maybe a cleaner way to do this
  const playlistKbarFill = usePlaylistsKBarFill(playlists)
  useRegisterActions([...playlistKbarFill].filter(Boolean), [playlistKbarFill])
  return (
    <AppContext.Provider
      value={{
        audio,
        setAudioPlayer,
        status,
        setStatus,
        oldAudioList,
        setOldAudioList,
        audioList,
        setAudioList,
        playlists,
        setPlaylist,
        playlistCheckedState,
        setPlaylistCheckedState,
        currentPlaylistListening,
        setCurrentPlaylistListening,
        setAudioById,
        isPlaying,
        setIsPlaying,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider }
