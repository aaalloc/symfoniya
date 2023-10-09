/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import "@egjs/react-flicking/dist/flicking.css"

import Flicking from "@egjs/react-flicking"
export function PlaylistCarouselControls(flickerRef: {
  flickerRef: React.RefObject<Flicking>
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          void flickerRef.flickerRef.current?.prev().catch(() => void 0)
        }}
        disabled={false}
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
        onClick={() => {
          void flickerRef.flickerRef.current?.next().catch(() => void 0)
        }}
        disabled={false}
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
