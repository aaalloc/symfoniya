import type { NextPage } from "next"
import Head from "next/head"
import { useState } from "react"
import { playlists } from "@/components/data/playlists"
import { MenubarDemo } from "@/components/MenubarDemo"
import { Player } from "@/components/Player"
import Music from "./music"
import { Audio } from "@/components/types/audio"
import { Search } from "@/components/Search"
import { Sidebar } from "@/components/Sidebar"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

const Home: NextPage = () => {
  const [scene, setScene] = useState<string>("Home")
  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  return (
    <>
      <Head>
        <title>Symfoniya</title>
        <meta name="description" content="Music player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-0 m-0 h-screen w-screen select-none overflow-hidden" >
        <MenubarDemo />
        <div className="flex divide-x h-full pb-24">
          <Sidebar
            setAudios={setAudioList}
            playlists={playlists}
            setScene={setScene}
            className="basis-1/5"
          />
          <div className="flex-1 flex flex-col gap-4 h-full items-stretch">
            <Search />
            {scene == "Musics" ? (
              <Music audioList={audioList} setter={setAudioPlayer} />
            ) : null}
          </div>
        </div>
        <Player currentAudio={audio} audioList={audioList} setter={setAudioPlayer} />
      </main>
    </>
  )
}

export default Home