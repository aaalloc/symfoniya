/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { KeenSliderInstance } from "keen-slider/react"

export const PlaylistCarouselControls = ({
  instanceRef,
  currentSlide,
}: {
  instanceRef: React.MutableRefObject<KeenSliderInstance | null>
  currentSlide: number
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-confusing-void-expression
          void e.stopPropagation() || instanceRef.current?.prev()
        }}
        disabled={currentSlide === 0}
        className={`h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center
        transition ease-in-out duration-150 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50
        disabled:cursor-not-allowed`}
      >
        <svg
          className="w-6 h-6 text-slate-600 dark:text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={(e: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          e.stopPropagation() || instanceRef.current?.next()
        }}
        disabled={
          false
          // bellow is null only when charging the web completly or after a refresh made by user
          //currentSlide === instanceRef.current.track.details.slides.length - 1
        }
        className={`h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center
        transition ease-in-out duration-150 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50
        disabled:cursor-not-allowed`}
      >
        <svg
          className="w-6 h-6 text-slate-600 dark:text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  )
}
