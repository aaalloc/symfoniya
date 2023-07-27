import { Home, Library, ListMusic, Mic2, Music2, User } from "lucide-react"
import Router from "next/router"
import { useContext } from "react"

import { AddMusic } from "@/components/AddMusic"
import { AppContext } from "@/components/AppContext"
import { Playlist } from "@/components/data/playlists"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  playlists: Playlist[]
}

export function Sidebar({ className, playlists }: SidebarProps) {
  const { setAudioList } = useContext(AppContext)
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <AddMusic setter={setAudioList} />
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => Router.push("/")}
              variant="ghost"
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => Router.push("/music")}
              variant="ghost"
              className="w-full justify-start"
            >
              <Music2 className="mr-2 h-4 w-4" />
              Musics
            </Button>
            <Button
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => Router.push("/")}
              variant="ghost"
              className="w-full justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              Genre
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Mic2 className="mr-2 h-4 w-4" />
              Artists
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Library className="mr-2 h-4 w-4" />
              Albums
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <ScrollArea className="h-[500px] px-1">
            <div className="space-y-1 p-2">
              {playlists.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <ListMusic className="mr-2 h-4 w-4" />
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
