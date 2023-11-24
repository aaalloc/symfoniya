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
  if (byteArray.length === 0) return noJacketIMG
  // performance issue here !!!
  return `data:image/png;base64,${base64.bytesToBase64(byteArray)}`
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
