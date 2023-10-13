/* eslint-disable @typescript-eslint/no-misused-promises */
import { Home, Library, ListMusic, Mic2, Music2, User } from "lucide-react"
import Router from "next/router"
import { useContext } from "react"

import { AppContext } from "@/components/AppContext"
import { AddMusic } from "@/components/modals/AddMusic"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { CreatePlaylist } from "./modals/CreatePlaylist"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function create_button(name: string, icon: any, onClick: () => void) {
  return (
    <Button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onClick}
      variant="ghost"
      className="w-full justify-start"
    >
      {icon}
      {name}
    </Button>
  )
}

export function Sidebar({ className: className }: { className?: string }) {
  const { setAudioList } = useContext(AppContext)
  const buttons = [
    {
      label: "Home",
      component: <Home className="mr-2 h-4 w-4" />,
      onClick: () => Router.push("/"),
    },
    {
      label: "Musics",
      component: <Music2 className="mr-2 h-4 w-4" />,
      onClick: () =>
        Router.push({
          pathname: "/playlist",
          query: { playlist: "all" },
        }),
    },
    {
      label: "Genre",
      component: <User className="mr-2 h-4 w-4" />,
      onClick: () =>
        Router.push({
          pathname: "/",
        }),
    },
    {
      label: "Artists",
      component: <Mic2 className="mr-2 h-4 w-4" />,
      onClick: () => Router.push("/"),
    },
    {
      label: "Albums",
      component: <Library className="mr-2 h-4 w-4" />,
      onClick: () => Router.push("/"),
    },
  ]
  const { playlists } = useContext(AppContext)
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <AddMusic setter={setAudioList} />
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {buttons.map((button) =>
              create_button(button.label, button.component, button.onClick),
            )}
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <div className="px-3 py-2">
            <CreatePlaylist />
          </div>
          <ScrollArea className="h-[450px] px-1">
            <div className="space-y-1 p-2">
              {playlists.map((playlist, i) => (
                <Button
                  key={`${playlist.name}-${i}`}
                  variant="ghost"
                  onClick={() => {
                    console.log("playlist", playlist)
                    void Router.push({
                      pathname: "/playlist",
                      query: { playlist: playlist.name },
                    })
                  }}
                  className="w-full justify-start font-normal"
                >
                  <ListMusic className="mr-2 h-4 w-4" />
                  {playlist.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
