import { useState, createContext } from 'react';
import { Audio } from "@/components/types/audio"


const AppContext = createContext({
    audio: {} as Audio,
    setAudioPlayer: {} as Function,
    audioList: [] as Audio[],
    setAudioList: {} as Function
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