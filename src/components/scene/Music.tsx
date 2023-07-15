import { ScrollArea } from "@radix-ui/react-scroll-area"

const tracks = {
    title: "idk",
    artist: "me",
    id: 12,
    total_time: 2301,
    cover: [0]
}

export type audiotracks = typeof tracks
interface AudioTracks {
    title: string
    artist: string
    id: number
    total_time: number
    cover: number[] // byte array
}
interface MusicProps extends React.HTMLAttributes<HTMLDivElement> {
    // array of 
    audios: AudioTracks[]
}

export function Music({ audios }: MusicProps) {
    return (
        <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
                {audios.map((value) => {
                    return <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                            <img className="h-10 w-10 rounded-md" src={`data:image/png;base64,${value.cover}`} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{value.title}</p>
                            <p className="text-sm text-gray-500 truncate">{value.artist}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 truncate">{value.total_time}</p>
                        </div>
                    </div>
                })}
            </div>
        </ScrollArea>
    )
}