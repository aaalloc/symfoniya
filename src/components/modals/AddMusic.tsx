/* eslint-disable @typescript-eslint/no-misused-promises */
import { DialogClose } from "@radix-ui/react-dialog"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { invoke } from "@tauri-apps/api/tauri"
import { FolderPlus, X, Youtube } from "lucide-react"
import { useState } from "react"

import { Audio } from "@/components/types/audio"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

import GlowingGradientBorderButton from "../ui/gradient_button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
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

export function AddMusic(props: { setter: (audioList: Audio[]) => void }) {
  const { toast } = useToast()
  const [arr_path, setPath] = useState<string[]>([])
  const removePath = (path: string) => {
    //console.log(path)
    setPath(
      arr_path.filter((value) => {
        return value !== path
      }),
    )
  }

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
    }
  }

  const choose_ytb = async () => {
    // TODO: implement
  }

  const handle_submit = () => {
    invoke<string>("import_from_folders", { folders: arr_path })
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <GlowingGradientBorderButton>Add musics</GlowingGradientBorderButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[410px]">
        <DialogHeader>
          <DialogTitle>Add musics</DialogTitle>
          <DialogDescription>
            Add musics from folders (you can select multiple folders) or from YouTube
            button.
          </DialogDescription>
        </DialogHeader>
        {/* value={path == null ? "Something happened ..." : path} */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paths</TableHead>
              </TableRow>
            </TableHeader>
            {/* <TableCaption>Path selected</TableCaption> */}
            {/* patch w-1 when path to big*/}
            <ScrollArea className="h-36">
              <TableBody>
                {typeof arr_path === "string" ? (
                  <MusicPath value={arr_path} onRemove={removePath} />
                ) : arr_path.length === 0 ? (
                  <MusicPath
                    key={0}
                    value={"No paths selected"}
                    onRemove={removePath}
                  />
                ) : (
                  arr_path.map((value, i) => (
                    <MusicPath key={i} value={value} onRemove={removePath} />
                  ))
                )}
              </TableBody>
            </ScrollArea>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={choose_path}>
            <FolderPlus />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Youtube />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Youtube</h4>
                  <p className="text-sm text-muted-foreground">
                    Give a YouTube link to download the music
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      defaultValue="https://www.youtube.com/"
                      className="col-span-3 h-8"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DialogClose>
            <Button
              onClick={handle_submit}
              disabled={!(arr_path.length > 0)}
              type="submit"
            >
              Import musics
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
