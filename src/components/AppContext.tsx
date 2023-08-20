import { invoke } from "@tauri-apps/api/tauri"
import { useRouter } from "next/router"
import { createContext, useEffect, useState } from "react"

import { Audio } from "@/components/types/audio"
import { Playlist } from "@/components/types/playlist"

type PlaylistCheckedState = Record<string, Record<string, boolean>>

const AppContext = createContext({
  audio: {} as Audio,
  setAudioPlayer: {} as (audio: Audio) => void,
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
})

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
  const router = useRouter()
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

  const setAudioById = (id: number) => {
    const playlistPage = router.query.playlist as string
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (currentPlaylistListening === playlistPage) {
      setAudioPlayer(audioList[id])
    } else {
      setAudioPlayer(oldAudioList[id])
    }
  }

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

  return (
    <AppContext.Provider
      value={{
        audio,
        setAudioPlayer,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider }
