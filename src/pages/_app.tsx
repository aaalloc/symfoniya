import "@/styles/globals.scss"

import type { AppProps } from "next/app"
import { ThemeProvider } from "next-themes"

import { AppContextProvider } from "@/components/AppContext"
import Layout from "@/components/Layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import NoSSR from "@/components/utilities/NoSSR"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <NoSSR>
          <AppContextProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AppContextProvider>
        </NoSSR>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default MyApp
