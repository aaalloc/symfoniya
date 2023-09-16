// import { Howl } from "howler"
import { readBinaryFile } from "@tauri-apps/api/fs"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import { Howl } from "howler"
import { useRouter } from "next/router"

import { Button } from "@/components/ui/button"

const filePath = "/home/yanovskyy/Musique/Putty Boy Strut.mp3"
const assetUrl = convertFileSrc(filePath)
const e = await readBinaryFile(filePath)

const GenrePage = () => {
  const router = useRouter()
  const data = router.query
  console.log(data.playlist)

  return (
    <Button
      variant="ghost"
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        // const sound = new Howl({
        //   src: [assetUrl],
        // }) // Origin http://localhost:1420 is not allowed
        // // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        // sound.play()
        const sound = new Audio(assetUrl)
        void sound.play().then(() => {
          console.log("ok")
        })
      }}
      className="w-full justify-start font-normal"
    >
      ok
    </Button>
  )
}

export default GenrePage
