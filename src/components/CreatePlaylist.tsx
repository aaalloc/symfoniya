"use client"

import { DialogClose } from "@radix-ui/react-dialog"
import { Audio } from "@/components/types/audio"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { AppContext } from "@/components/AppContext"
import { useContext } from "react"

const formSchema = z.object({
    playlist_name: z.string().min(2).max(50),
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

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: "Playlist",
            description: `${values.playlist_name} created !`,
        })
        setPlaylist([...playlists, values.playlist_name])
        // TODO: save playlist db
        // clear form
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
