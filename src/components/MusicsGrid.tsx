import Flicking from "@egjs/react-flicking"
import { useContext } from "react"

import { Audio } from "@/components/types/audio"
import { MusicCard } from "@/pages/music"

import { AppContext } from "./AppContext"

const itemsPerCol = 3

export const MusicsGrid = ({ audios }: { audios: Audio[] }) => {
  const context = useContext(AppContext)

  const audiosInCols = audios.reduce<Audio[][]>((acc, curr, i) => {
    const colIndex = Math.floor(i / itemsPerCol)
    if (!acc[colIndex]) {
      acc[colIndex] = []
    }
    acc[colIndex].push(curr)
    return acc
  }, [])

  return (
    <div className="w-full">
      <Flicking
        renderOnlyVisible={true}
        align="prev"
        useResizeObserver={true}
        useFractionalSize={true}
      >
        {Boolean(audiosInCols) && audiosInCols.length ? (
          audiosInCols.map((col, colIndex) => {
            return (
              <div className="flicking-panel w-96" key={colIndex}>
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
