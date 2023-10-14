import Flicking from "@egjs/react-flicking"
import { useContext, useRef } from "react"

import { Audio } from "@/components/types/audio"
import { MusicCard } from "@/pages/music"

import { AppContext } from "./AppContext"
import { CarouselControls } from "./CarouselControls"

const itemsPerCol = 3

export const MusicsGrid = ({ audios, title }: { audios?: Audio[]; title: string }) => {
  const context = useContext(AppContext)
  const flickingRef = useRef<Flicking>(null)

  const audiosInCols = audios
    ? audios.reduce<Audio[][]>((acc, curr, i) => {
        const colIndex = Math.floor(i / itemsPerCol)
        if (!acc[colIndex]) {
          acc[colIndex] = []
        }
        acc[colIndex].push(curr)
        return acc
      }, [])
    : []

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center gap-2">
        <p className="text-lg tracking-tight lg:text-4xl font-extrabold">{title}</p>
        <CarouselControls flickerRef={flickingRef} />
      </div>
      <Flicking panelsPerView={3} autoResize={true} ref={flickingRef} align="prev">
        {Boolean(audiosInCols) && audiosInCols.length ? (
          audiosInCols.map((col, colIndex) => {
            return (
              <div className="flicking-panel" key={colIndex}>
                {col.map((value, index) => (
                  <MusicCard
                    audio={value}
                    context={context}
                    name="recent"
                    key={index}
                  />
                ))}
              </div>
            )
          })
        ) : (
          <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
            No history found
          </p>
        )}
      </Flicking>
    </div>
  )
}
