import { invoke } from "@tauri-apps/api/tauri"
import { createContext, useEffect, useState } from "react"

import { Audio } from "@/components/types/audio"

const AppContext = createContext({
  audio: {} as Audio,
  setAudioPlayer: {} as (audio: Audio) => void,
  audioList: [] as Audio[],
  setAudioList: {} as (audioList: Audio[]) => void,
  playlists: [] as string[],
  setPlaylist: {} as (playlist: string[]) => void,
})

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
  useEffect(() => {
    invoke<number>("startup_audios_init")
      .then(async (response) => {
        if (response === 0) {
          return
        }
        const values = await invoke<Audio[]>("retrieve_audios")
        setAudioList(values)
      })
      .catch((error) => {
        console.error(error)
      })
    // TODO: fill playlists
  }, [])

  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  const [playlists, setPlaylist] = useState<string[]>([] as string[])
  return (
    <AppContext.Provider value={{ audio, setAudioPlayer, audioList, setAudioList, playlists, setPlaylist }}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider }
