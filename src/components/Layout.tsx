import { Moon, Sun } from "lucide-react"
import Head from "next/head"
import { useTheme } from "next-themes"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
//import { MenubarDemo } from "@/components/MenubarDemo"
import { Player } from "@/components/player/Player"
import { SearchBar } from "@/components/search/SearchBar"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

export default function Layout({ children }: { children: React.ReactElement }) {
  const { audio, setAudioPlayer, audioList, oldAudioList } = useContext(AppContext)
  const { theme, setTheme } = useTheme()
  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  const setAudioById = (id: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (audioList[id] !== undefined) {
      setAudioPlayer(audioList[id])
    } else {
      setAudioPlayer(oldAudioList[id])
    }
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
        <div className="flex divide-x h-full pb-12">
          <Sidebar className="basis-1/6" />
          <div className="flex-1 flex flex-col gap-4 h-full items-stretch">
            <div className="flex justify-normal items-center px-[18rem]">
              <SearchBar />
              <Button
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark")
                }}
                variant="ghost"
                className="h-10 w-10 p-0"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
            {children}
          </div>
        </div>
        <Player currentAudio={audio} setter={setAudioById} />
      </main>
    </>
  )
}
