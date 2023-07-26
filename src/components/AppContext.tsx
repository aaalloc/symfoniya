import { createContext, useState } from "react"

import { Audio } from "@/components/types/audio"

const AppContext = createContext({
  audio: {} as Audio,
  setAudioPlayer: {} as (audio: Audio) => void,
  audioList: [] as Audio[],
  setAudioList: {} as (audioList: Audio[]) => void,
})

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  return (
    <AppContext.Provider value={{ audio, setAudioPlayer, audioList, setAudioList }}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppContextProvider }
