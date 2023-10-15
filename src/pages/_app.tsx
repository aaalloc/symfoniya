/* eslint-disable react/display-name */
import "@/styles/globals.scss"

import { KBarProvider } from "kbar"
import type { AppProps } from "next/app"
import { ThemeProvider } from "next-themes"
import * as React from "react"

import { AppContextProvider } from "@/components/AppContext"
import Layout from "@/components/Layout"
import { Search } from "@/components/search/Search"
import { TooltipProvider } from "@/components/ui/tooltip"
import NoSSR from "@/components/utilities/NoSSR"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <NoSSR>
          <KBarProvider>
            <Search />
            <AppContextProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AppContextProvider>
          </KBarProvider>
        </NoSSR>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default MyApp
