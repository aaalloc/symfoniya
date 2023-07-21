import { ScrollArea } from "@radix-ui/react-scroll-area"
import { invoke } from "@tauri-apps/api/tauri"
import * as base64 from "byte-base64"
import { useEffect, useState } from "react"

import { Toggle } from "@/components/ui/toggle"

import { Button } from "../ui/button"

interface Audio {
    title: string
    artist: string
    album: string
    id: number
    duration: number
    cover: number[] // byte array
}

export type { Audio }
interface MusicProps extends React.HTMLAttributes<HTMLDivElement> {
    // array of
    audios: Audio[]
}

async function get_audios(): Promise<Audio[]> {
    const audios: Audio[] = []
    try {
        const values: any = await invoke("retrieve_audios")
        //console.log(values);
        return values as Audio[]
    } catch (error) {
        console.error(error)
        return audios
    }
}

function Uint8ToString(u8a: number[]) {
    const CHUNK_SZ = 0x8000
    const c = []
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)))
    }
    return c.join("")
}

function grayByteArr() {
    const grayByteArray: number[] = []
    for (let i = 0; i < 256; i++) {
        grayByteArray.push(i)
        grayByteArray.push(i)
        grayByteArray.push(i)
        grayByteArray.push(255)
    }
    return grayByteArray
}

function byteToImage(byteArray: number[]) {
    const base64String = base64.bytesToBase64(
        byteArray.length > 0 ? byteArray : grayByteArr(),
    )
    return `data:image/png;base64,${base64String}`
}

function format_duration(duration: number) {
    let minutes: any = Math.floor(duration / 60)
    if (minutes < 10) {
        minutes = `0${minutes}`
    }
    let seconds: any = Math.floor(duration % 60)
    if (seconds < 10) {
        seconds = `0${seconds}`
    }
    return `${minutes}:${seconds}`
}

export function Music(props: { audioList: Audio[]; setter: Function }) {
    //const [audios, setAudios] = useState<Audio[]>([]);
    /*
        useEffect(() => {
            async function fetchAudios() {
                try {
                    const response = await get_audios();
                    setAudios(response);
                } catch (error) {
                    console.error(error);
                }
            }
    
            fetchAudios();
        }, []);*/

    return (
        <div className="h-full flex-1 flex flex-col gap-6">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl container">
                Musics
            </h1>
            <div className="h-full overflow-y-auto">
                <div className="container flex flex-col gap-2 items-stretch">
                    {props.audioList.map((value) => {
                        return (
                            <div
                                key={value.id}
                                onClick={() => {
                                    props.setter(value)
                                }}
                                className="p-6 rounded-lg transition ease-in-out delay-90 dark:hover:bg-gray-900 hover:bg-gray-50 duration-150 flex items-center space-x-8"
                            >
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-14 w-14 rounded-md"
                                        src={byteToImage(value.cover)}
                                        alt=""
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold">{value.title}</p>
                                    <p className="text-sm text-muted-foreground">{value.artist}</p>
                                </div>
                                <div>
                                    <p className="">{format_duration(value.duration)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
