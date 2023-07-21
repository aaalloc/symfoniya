import "@/styles/globals.scss"

import type { AppProps } from "next/app"
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Component {...pageProps} />
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default MyApp
