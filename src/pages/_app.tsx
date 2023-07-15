import "@/styles/globals.scss"

import type { AppProps } from "next/app"
import { ThemeProvider } from 'next-themes'
import { Toaster } from "@/components/ui/toaster"

function MyApp({ Component, pageProps }: AppProps) {
  return (

    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  )
}

export default MyApp
