/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { Folder } from "lucide-react"
import { useEffect, useState } from "react"
import { set, useForm } from "react-hook-form"
import * as z from "zod"

import {
  ErrorItem,
  Item,
  MusicItem,
  TotalItem,
  TypeItem,
} from "@/components/types/download_audio"
import { Task } from "@/components/types/schema"
import { Button } from "@/components/ui/button"
import { columns } from "@/components/ui/columns"
import { DataTable } from "@/components/ui/data-table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UserNav } from "@/components/ui/user-nav"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  url: z.string().url(),
  path: z.string({
    required_error: "A path is required.",
  }),
})

const DownloadPage = () => {
  const { toast } = useToast()
  const [taskdata, setTaskdata] = useState<Task[]>([])
  const choose_path = async (setValue: (value: string) => void) => {
    const import_dialog = await import("@tauri-apps/api/dialog")
    const import_path = await import("@tauri-apps/api/path")
    const new_paths = await import_dialog.open({
      directory: true,
      multiple: false,
      defaultPath: await import_path.audioDir(),
    })
    if (new_paths !== null) {
      setValue(new_paths as string)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  })

  const download_from_web = (values: z.infer<typeof formSchema>) => {
    void invoke("download_audio_from_links", {
      url: values.url,
      path: values.path,
    })
    form.reset()
  }

  useEffect(() => {
    const unlisten = listen("result_from_download", (event) => {
      const value = event.payload as Item
      if (value.type === TypeItem[TypeItem.Result]) {
        const response = event.payload as MusicItem
        // to enhance
        setTaskdata((old) =>
          old.map((task) =>
            task.title === response.title
              ? {
                ...task,
                status: "done",
              }
              : task,
          ),
        )
      } else if (value.type === TypeItem[TypeItem.Awaiting]) {
        const response = event.payload as TotalItem
        console.log(response)
        response.musics.forEach((music) => {
          setTaskdata((old) => [
            ...old,
            {
              id: "1",
              title: music.title,
              duration: new Date(music.duration * 1000).toISOString().substring(11, 19),
              status: "in progress",
              label: "Downloading",
            },
          ])
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
      <div className="h-full flex flex-col gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
          Download
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(download_from_web)}
            className="flex-column flex container gap-x-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="music_url">Music URL</Label>
                      <Input
                        className="w-64"
                        id="music_url"
                        placeholder="Enter music URL..."
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="filepath">Save destination</Label>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-64 justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        id="filepath"
                        onClick={() => choose_path(field.onChange)}
                        {...field}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {!field.value ? "Select a path" : field.value}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Download</Button>
          </form>
        </Form>
        <DataTable data={taskdata} columns={columns} />
      </div>
    </>
  )
}

export default DownloadPage
