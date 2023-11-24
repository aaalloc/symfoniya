/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import noJacketIMG from "public/playlist_no_jacket.png"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isObjectEmpty(objectName: object) {
  return Object.keys(objectName).length === 0
}

export function b64imageWrap(b64image: string) {
  // return noJacketIMG
  if (b64image.length === 0) return noJacketIMG
  return `data:image/png;base64,${b64image}`
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

export function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay))
}
