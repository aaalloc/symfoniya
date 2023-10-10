import { readBinaryFile } from "@tauri-apps/api/fs"
import { convertFileSrc } from "@tauri-apps/api/tauri"
import { useRouter } from "next/router"
import { useState } from "react"

import { Button } from "@/components/ui/button"

const GenrePage = () => {
  const [urlAUdio, setUrlAudio] = useState<string>("")
  const router = useRouter()
  const data = router.query
  console.log(data.playlist)

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          const filePath = "/home/yanovskyy/Musique/Shinigami.m4a"
          fetch(convertFileSrc(filePath))
            .then((res) => {
              // create blob url from response
              res
                .blob()
                .then((blob) => {
                  const url = URL.createObjectURL(blob)
                  setUrlAudio(url)
                })
                .catch((err) => {
                  console.error(err)
                })
            })
            .catch((err) => {
              console.error(err)
            })
        }}
        className="w-full justify-start font-normal"
      >
        ok
      </Button>
      <audio controls>
        <source src={urlAUdio} type="audio/mpeg" />
      </audio>
    </>
  )
}

export default GenrePage
