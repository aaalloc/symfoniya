import type { NextPage } from "next"

import { useGlobalShortcut } from "@/hooks/tauri/shortcuts"

const Home: NextPage = () => {
  useGlobalShortcut("CommandOrControl+P", () => {
    console.log("Ctrl+P was pressed!")
  })

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}

export default Home
