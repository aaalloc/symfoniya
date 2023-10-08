/* eslint-disable @next/next/no-img-element */
import "keen-slider/keen-slider.min.css"

import { useKeenSlider } from "keen-slider/react"
import Router from "next/router"
import { useState } from "react"

import { byteToImage } from "@/lib/utils"
import { WheelControls } from "@/lib/wheel-controls"

import { PlaylistCarouselControls } from "./PlaylistCarouselControls"
import { Playlist } from "./types/playlist"

export const PlaylistCarousel = ({
  playlists,
  title,
}: {
  playlists: Playlist[]
  title: string
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      slides: {
        perView: 4,
      },
      breakpoints: {
        "(max-width: 1279px)": {
          slides: {
            perView: 4,
          },
        },
        "(max-width: 1023px)": {
          slides: {
            perView: 3,
          },
        },
        "(max-width: 767px)": {
          slides: {
            perView: 1,
          },
        },
      },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setLoaded(true)
      },
    },
    [WheelControls],
  )
  console.log(instanceRef.current)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-lg font-medium tracking-tight lg:text-xl">{title}</p>
        {loaded && instanceRef.current && (
          <PlaylistCarouselControls
            instanceRef={instanceRef}
            currentSlide={currentSlide}
          />
        )}
      </div>
      <div className="keen-slider" ref={sliderRef}>
        {playlists.length !== 0 ? (
          playlists.map((value, index) => {
            return (
              <button
                key={index}
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={() => {
                  void Router.push({
                    pathname: "/playlist",
                    query: { playlist: value.name },
                  })
                }}
                id={`playlist-${value.name}`}
                className="keen-slider__slide flex flex-col gap-4 items-center justify-start cursor-pointer hover:bg-gray-50 duration-150
              delay-90 dark:hover:bg-gray-900 p-4 rounded-lg transition ease-in-out"
              >
                <img
                  src={byteToImage(value.cover)}
                  className="aspect-square rounded-lg"
                  alt={value.name}
                />
                <div className="flex flex-col w-full px-1">
                  <h2 className="text-left text-sm font-medium truncate">
                    {value.name}
                  </h2>
                  <p className="text-left text-xs truncate text-slate-600 dark:text-slate-400">
                    {value.count} songs
                  </p>
                </div>
              </button>
            )
          })
        ) : (
          <p className="text-center text-lg font-medium text-slate-600 dark:text-slate-400">
            No playlist found
          </p>
        )}
      </div>
    </div>
  )
}
