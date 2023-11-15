enum TypeItem {
  Result,
  Awaiting,
  Error,
}

interface Item {
  type: string
}

interface MusicItem {
  title: string
  link: string
  duration: number
}

interface TotalItem {
  musics: MusicItem[]
  total: number
}

interface ErrorItem {
  error: string
}

export type { ErrorItem, Item, MusicItem, TotalItem }
export { TypeItem }
