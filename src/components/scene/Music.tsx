import { ScrollArea } from "@radix-ui/react-scroll-area"
import { invoke } from "@tauri-apps/api/tauri"
import { useState, useEffect } from "react"
type Audio = {
    title: string
    artist: string
    album: string
    id: number
    duration: number
    cover: number[] // byte array
}

export type { Audio };
interface MusicProps extends React.HTMLAttributes<HTMLDivElement> {
    // array of 
    audios: Audio[]
}

async function get_audios(): Promise<Audio[]> {
    let audios: Audio[] = [];
    try {
        const values: any = await invoke("retrieve_audios");
        console.log(values);
        return values as Audio[];
    } catch (error) {
        console.error(error);
        return audios;
    }
}

function format_duration(duration: number) {
    // duration is in seconds
    let minutes = Math.floor(duration / 60);
    let seconds = duration % 60;
    return `${minutes}:${seconds}`
}
export function Music() {
    const [audios, setAudios] = useState<Audio[]>([]);
    useEffect(() => {
        async function fetchAudios() {
            try {
                const response = await get_audios();
                setAudios(response);
            } catch (error) {
                // Gérer l'erreur ici
                console.error(error);
            }
        }

        fetchAudios();
    }, []);

    return (
        <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
                {audios.map((value) => {
                    return <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-md" src={`data:image/png;base64,${value.cover}`} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold">{value.title}</p>
                            <p className="text-sm text-muted-foreground">{value.artist}</p>
                        </div>
                        <div>
                            <p>{format_duration(value.duration)}</p>
                        </div>
                    </div>
                })}
            </div>
        </ScrollArea>
    )
}