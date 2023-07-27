/* eslint-disable @typescript-eslint/no-misused-promises */
import { Minus, Moon, Sun, X } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Menubar } from "@/components/ui/menubar"

export function MenubarDemo() {
  const { theme, setTheme } = useTheme()
  const close = async () => {
    const import_window = import("@tauri-apps/api/window")
    const zz = (await import_window).appWindow
    await zz.close()
  }
  const minimised = async () => {
    const import_window = import("@tauri-apps/api/window")
    const zz = (await import_window).appWindow
    await zz.minimize()
  }

  const drag = async () => {
    const import_window = import("@tauri-apps/api/window")
    const zz = (await import_window).appWindow
    await zz.startDragging()
  }

  return (
    <Menubar className="sticky top-0">
      {/* Space */}
      <Button
        onClick={() => {
          setTheme(theme === "dark" ? "light" : "dark")
        }}
        variant="ghost"
        className="h-8 w-8 p-0"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <div className="flex-1" onMouseDown={drag}>
        <h1 className="text-transparent text-center">Symfoniya</h1>
      </div>
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={minimised}>
        <Minus />
      </Button>
      <Button variant="ghost" className="h-8 w-8 p-0" onClick={close}>
        <X />
      </Button>
    </Menubar>
  )
}
