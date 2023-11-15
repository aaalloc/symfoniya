/* eslint-disable @typescript-eslint/no-misused-promises */
import { PopoverClose } from "@radix-ui/react-popover"
import { invoke } from "@tauri-apps/api/tauri"
import { Download, FolderInput, X } from "lucide-react"
import Router from "next/router"
import { useState } from "react"

import { Audio } from "@/components/types/audio"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

// import GlowingGradientBorderButton from "../ui/gradient_button"
// import { Input } from "../ui/input"
// import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

async function get_audios(): Promise<Audio[]> {
  const audios: Audio[] = []
  try {
    const values = await invoke("retrieve_audios", { playlists: "all" })
    return values as Audio[]
  } catch (error) {
    console.error(error)
    return audios
  }
}

async function wrapper_setter_audio(setter: (response: Audio[]) => void) {
  try {
    const response = await get_audios()
    console.log(response)
    setter(response)
  } catch (error) {
    console.error(error)
  }
}

export function MusicPath(props: { value: string; onRemove: (value: string) => void }) {
  return (
    <TableRow>
      <TableCell>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <p className="truncate max-w-[250px] text-left">{props.value}</p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{props.value}</p>
          </TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell className="w-1/12">
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Remove path</span>
          <X
            onClick={() => {
              props.onRemove(props.value)
            }}
            className="h-4 w-4"
          />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export function AddMusic(props: { setter: (audioList: Audio[]) => void }) {
  const { toast } = useToast()
  const [arr_path, setPath] = useState<string[]>([])

  const choose_path = async () => {
    const import_dialog = await import("@tauri-apps/api/dialog")
    const import_path = await import("@tauri-apps/api/path")
    const new_paths = await import_dialog.open({
      directory: true,
      multiple: true,
      defaultPath: await import_path.audioDir(),
    })
    if (new_paths !== null) {
      const paths_to_add = (new_paths as string[]).filter(
        (path: string) => !arr_path.includes(path),
      )
      const updated_paths = [...arr_path, ...paths_to_add]
      setPath(updated_paths)
      handle_submit(updated_paths)
    }
  }

  const handle_submit = (updated_paths: string[]) => {
    invoke<string>("import_from_folders", { folders: updated_paths })
      .then((value) => {
        toast({
          title: "Musics added",
          description: `${value} musics discovered`,
          variant: "success",
        })
        void wrapper_setter_audio(props.setter)
      })
      .catch(() => {
        toast({
          title: "Musics added",
          description: "Something went wrong",
          variant: "destructive",
        })
      })
  }

  const gradient = "bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F]"
  const gradient_blurred =
    "bg-gradient-to-r to-[#00C5DF]/40 via-[#FFC700]/40 from-[#F2371F]/40"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex justify-center text-center items-center w-full">
          <div className="relative group">
            <div
              className={cn(
                "absolute -inset-0.5 rounded-2xl blur-lg group-hover:blur-lg  transition duration-500 group-hover:duration-200 will-change-filter overflow-hidden",
                gradient_blurred,
              )}
            />
            <div className="relative group-hover:scale-105 duration-500 group-hover:duration-200">
              <div
                className={cn(
                  "block inset-0.5 rounded-xl p-[3px] transition",
                  gradient,
                )}
              >
                <div className="w-56 px-4 py-[10px] text-sm font-medium color-white bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg">
                  Add musics
                </div>
              </div>
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <PopoverClose
            onClick={choose_path}
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <div className="flex items-center gap-x-4">
              <FolderInput />
              <p className="text-start text-sm text-muted-foreground">Select folders</p>
            </div>
          </PopoverClose>
          <PopoverClose
            onClick={() => Router.push("/download")}
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <div className="flex items-center gap-x-4">
              <Download />
              <p className="text-start text-sm text-muted-foreground">
                Download musics
              </p>
            </div>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}
