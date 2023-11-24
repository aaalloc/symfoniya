/* eslint-disable @typescript-eslint/no-explicit-any */
import * as base64 from "byte-base64"
import { type ClassValue, clsx } from "clsx"
import noJacketIMG from "public/playlist_no_jacket.png"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isObjectEmpty(objectName: object) {
  return Object.keys(objectName).length === 0
}

export function byteToImage(byteArray: number[]) {
  return noJacketIMG
  if (byteArray.length === 0) return noJacketIMG
  // performance issue here !!! Because of the recurrent base64 encoding for a lot of image
  return `data:image/png;base64,${Buffer.from(byteArray).toString("base64")}`
  // work around but it takes a lot of memory if we have a lot lot lot of image
  return URL.createObjectURL(new Blob([new Uint8Array(byteArray)]))
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
