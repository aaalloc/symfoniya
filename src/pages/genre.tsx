import { readBinaryFile } from "@tauri-apps/api/fs"
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
          void readBinaryFile(filePath)
            .catch((err) => {
              console.error(err)
            })
            .then((res) => {
              const fileBlob = new Blob([res as ArrayBuffer], { type: "audio/mpeg" })
              const reader = new FileReader()
              reader.readAsDataURL(fileBlob)
              const url = URL.createObjectURL(fileBlob)
              setUrlAudio(url)
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
