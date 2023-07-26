/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function format_duration(duration: number) {
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
