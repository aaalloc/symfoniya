/* eslint-disable @typescript-eslint/no-explicit-any */
import * as base64 from "byte-base64"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const grayb64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mO8Ww8AAj8BXkQ+xPEAAAAASUVORK5CYII="

export function byteToImage(byteArray: number[]) {
  const base64String = byteArray.length > 0 ? base64.bytesToBase64(byteArray) : grayb64
  return `data:image/png;base64,${base64String}`
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
