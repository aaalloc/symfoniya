import { invoke } from "@tauri-apps/api/tauri"
import { createContext, useEffect, useState } from "react"

import { Audio } from "@/components/types/audio"

const AppContext = createContext({
  audio: {} as Audio,
  setAudioPlayer: {} as (audio: Audio) => void,
  audioList: [] as Audio[],
  setAudioList: {} as (audioList: Audio[]) => void,
  oldAudioList: [] as Audio[],
  setOldAudioList: {} as (audioList: Audio[]) => void,
  playlists: [] as string[],
  setPlaylist: {} as (playlist: string[]) => void,
})

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
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
    invoke<string[]>("get_playlists")
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

  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  const [oldAudioList, setOldAudioList] = useState<Audio[]>([] as Audio[])
  const [playlists, setPlaylist] = useState<string[]>([] as string[])
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider }
