import Head from "next/head"

//import { MenubarDemo } from "@/components/MenubarDemo"
import { Player } from "@/components/player/Player"
import { Sidebar } from "@/components/Sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

export default function Layout({ children }: { children: React.ReactElement }) {
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
      <main className="p-0 m-0 h-screen w-screen select-none overflow-hidden">
        <Toaster />
        <div className="flex divide-x h-full">
          <Sidebar className="basis-1/6" />
          <div className="flex flex-col pr-[-300px] mt-16 h-full w-full items-stretch mt-28">
            {children}
          </div>
        </div>
        <Player />
      </main>
    </>
  )
}
