import { invoke } from "@tauri-apps/api/tauri"

import type { NextPage } from "next"
import Head from "next/head"
import { useState, useCallback } from "react"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

import { AddMusic } from "@/components/AddMusic"
import { Sidebar } from "@/components/Sidebar"
import { playlists } from "@/components/data/playlists"
import { Audio, Music } from "@/components/scene/Music"
import { MenubarDemo } from "@/components/MenubarDemo"
import { Player } from "@/components/Player"
import { Search } from "@/components/scene/Search"

function isObjectEmpty(objectName: any) {
  return Object.keys(objectName).length === 0
}


const Home: NextPage = () => {
  const [scene, setScene] = useState<string>("Home")
  const [audio, setAudioPlayer] = useState<Audio>({} as Audio)
  const [audioList, setAudioList] = useState<Audio[]>([] as Audio[])
  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  return (
    <div className="flex min-h-screen flex-col">
      <Head>
        <title>Symfoniya</title>
        <meta name="description" content="Music player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MenubarDemo />
      <main className="flex flex-1 flex-col items-center justify-center py-8">
        <Search />
        <div className="grid lg:grid-cols-5">
          <Sidebar setAudios={setAudioList} playlists={playlists} setScene={setScene} className="hidden lg:block" />
          <div className="col-span-3 lg:col-span-4 lg:border-l">
            <div className="flex justify-between items-center px-12">
              <div className="flex items-center space-x-4">
                {scene == "Musics" ? <Music audioList={audioList} setter={setAudioPlayer} /> : null}
              </div>
            </div>
          </div>
        </div>
        {!isObjectEmpty(audio) ? <Player currentAudio={audio}
          setter={setAudioPlayer} /> : null}
      </main >
    </div >
  )
}

export default Home
