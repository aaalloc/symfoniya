/* eslint-disable react-hooks/exhaustive-deps */
import { listen } from "@tauri-apps/api/event"
import Head from "next/head"
import { useEffect } from "react"

import { Player } from "@/components/player/Player"
import { Sidebar } from "@/components/Sidebar"
import {
  ErrorItem,
  Item,
  MusicItem,
  TotalItem,
  TypeItem,
} from "@/components/types/download_audio"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

export default function Layout({ children }: { children: React.ReactElement }) {
  const { toast } = useToast()

  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  useEffect(() => {
    const unlisten = listen("result_from_download", (event) => {
      const value = event.payload as Item
      if (value.type === TypeItem[TypeItem.Result]) {
        const response = event.payload as MusicItem
        toast({
          title: "Music download",
          description: `${response.title} successfully downloaded`,
          variant: "success",
        })
      } else if (value.type === TypeItem[TypeItem.Awaiting]) {
        const response = event.payload as TotalItem
        console.log(response)
        toast({
          title: "Music download",
          description: `Awaiting ${response.total} download`,
        })
      } else if (value.type === TypeItem[TypeItem.Error]) {
        const response = event.payload as ErrorItem
        toast({
          title: "Music download",
          description: `Error: ${response.error}`,
          variant: "destructive",
        })
      }
    })
    return () => {
      unlisten
        .then((f) => {
          f()
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }, [])

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
          <div className="flex flex-col pr-[-300px] mt-26 h-full w-full items-stretch mt-28">
            {children}
          </div>
        </div>
        <Player />
      </main>
    </>
  )
}
