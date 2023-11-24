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
        cover: "" as string,
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className=" 
                  w-full 
                  space-y-4
                  transition ease-in-out delay-90 hover:opacity-90 duration-150"
          variant="outline"
        >
          Create playlist
        </Button>
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
