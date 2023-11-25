interface Audio {
  title: string
  artist: string
  album: string
  path: string
  id: number
  duration: number
  cover: string // base64
}

interface AudioStatus {
  status: string
  current: number
  total: number
}

export type { Audio, AudioStatus }
