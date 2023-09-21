/* eslint-disable @typescript-eslint/no-misused-promises */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DialogClose } from "@radix-ui/react-dialog"
import { invoke } from "@tauri-apps/api/tauri"
import { useContext } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AppContext } from "@/components/AppContext"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

import { Playlist } from "../types/playlist"
const formSchema = z.object({
  playlist_name: z.string().min(2).max(16),
})

export function CreatePlaylist() {
  const { playlists, setPlaylist } = useContext(AppContext)
  const { toast } = useToast()
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playlist_name: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await invoke("create_playlist", { name: values.playlist_name })
    if (!playlists.some((playlist) => playlist.name === values.playlist_name)) {
      const newPlaylist: Playlist = {
        name: values.playlist_name,
        count: 0,
        cover: [] as number[],
      }
      setPlaylist([...playlists, newPlaylist])
      toast({
        title: "Playlist",
        description: `${values.playlist_name} created !`,
      })
    } else {
      toast({
        title: "Playlist",
        description: `${values.playlist_name} already exist !`,
      })
    }
    form.reset()
  }

  const gradient = "bg-gradient-to-r to-[#00C5DF] via-[#FFC700] from-[#F2371F]"
  const gradient_blurred =
    "bg-gradient-to-r to-[#00C5DF]/50 via-[#FFC700]/50 from-[#F2371F]/50"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex justify-center text-center items-center">
          <div className="relative group">
            <div
              className={cn(
                "absolute -inset-0.5 rounded-2xl blur-lg  group-hover:blur-lg  transition duration-500 group-hover:duration-200 will-change-filter overflow-hidden",
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
                  Create playlist
                </div>
              </div>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create playlist</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="playlist_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Your playlist name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose>
                <Button type="submit">Create</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
