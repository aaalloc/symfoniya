interface Audio {
  title: string
  artist: string
  album: string
  path: string
  id: number
  duration: number
  cover: number[] // byte array
}

interface AudioStatus {
  status: string
  current: number
  total: number
}

export type { Audio, AudioStatus }
