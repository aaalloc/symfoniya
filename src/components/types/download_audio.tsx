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
}

interface TotalItem {
  music: MusicItem[]
  total: number
}

interface ErrorItem {
  error: string
}

export type { ErrorItem, Item, MusicItem, TotalItem }
export { TypeItem }
