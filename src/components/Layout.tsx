import Head from "next/head"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { playlists } from "@/components/data/playlists"
import { MenubarDemo } from "@/components/MenubarDemo"
import { Player } from "@/components/Player"
import { Search } from "@/components/Search"
import { Sidebar } from "@/components/Sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

export default function Layout({ children }: { children: React.ReactElement }) {
  const { audio, setAudioPlayer, audioList } = useContext(AppContext)
  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  const setAudioById = (id: number) => {
    setAudioPlayer(audioList[id])
  }

  return (
    <>
      <Head>
        <title>Symfoniya</title>
        <meta name="description" content="Music player" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="p-0 m-0 h-screen w-screen select-none overflow-hidden">
        <Toaster />
        <MenubarDemo />
        <div className="flex divide-x h-full pb-12">
          <Sidebar playlists={playlists} className="basis-1/5" />
          <div className="flex-1 flex flex-col gap-4 h-full items-stretch">
            <Search />
            {children}
          </div>
        </div>
        <Player currentAudio={audio} setter={setAudioById} />
      </main>
    </>
  )
}
