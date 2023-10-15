/* eslint-disable react/display-name */
import "@/styles/globals.scss"

import {
  ActionId,
  ActionImpl,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
} from "kbar"
import type { AppProps } from "next/app"
import { ThemeProvider } from "next-themes"
import * as React from "react"

import { AppContextProvider } from "@/components/AppContext"
import Layout from "@/components/Layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import NoSSR from "@/components/utilities/NoSSR"

function MyApp({ Component, pageProps }: AppProps) {
  const actions = [
    {
      id: "blog",
      name: "Blog",
      shortcut: ["b"],
      keywords: "writing words",
      perform: () => (window.location.pathname = "blog"),
    },
    {
      id: "contact",
      name: "Contact",
      shortcut: ["c"],
      keywords: "email",
      perform: () => (window.location.pathname = "contact"),
    },
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <KBarProvider actions={actions}>
        <CommandBar />
        <TooltipProvider>
          <NoSSR>
            <AppContextProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </AppContextProvider>
          </NoSSR>
        </TooltipProvider>
      </KBarProvider>
    </ThemeProvider>
  )
}
const searchStyle = {
  padding: "12px 16px",
  fontSize: "16px",
  width: "100%",
  boxSizing: "border-box" as React.CSSProperties["boxSizing"],
  outline: "none",
  border: "none",
}

const animatorStyle = {
  maxWidth: "600px",
  width: "100%",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "var(--shadow)",
}

const groupNameStyle = {
  padding: "8px 16px",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  opacity: 0.5,
}

function CommandBar() {
  return (
    <KBarPortal>
      <KBarPositioner>
        <KBarAnimator style={animatorStyle}>
          <KBarSearch className="bg-background" style={searchStyle} />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

CommandBar.displayName = "CommandBar"

function RenderResults() {
  const { results, rootActionId } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div style={groupNameStyle}>{item}</div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId}
          />
        )
      }
    />
  )
}

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl
      active: boolean
      currentRootActionId: ActionId | null | undefined
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      )
      // +1 removes the currentRootAction; e.g.
      // if we are on the "Set theme" parent action,
      // the UI should not display "Set theme… > Dark"
      // but rather just "Dark"
      return action.ancestors.slice(index + 1)
    }, [action.ancestors, currentRootActionId])

    return (
      <div
        ref={ref}
        className={`p-3 ${active ? "bg-muted" : "bg-background"} ${
          active ? "border-l-[3px] border-foreground" : ""
        } flex items-center justify-between cursor-pointer`}
      >
        <div className="flex gap-2 items-center text-base">
          {action.icon && action.icon}
          <div className="flex flex-col">
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <React.Fragment key={ancestor.id}>
                    <span className="opacity-50 mr-2">{ancestor.name}</span>
                    <span className="mr-2">&rsaquo;</span>
                  </React.Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && <span style={{ fontSize: 12 }}>{action.subtitle}</span>}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div aria-hidden className="grid grid-flow-col gap-1">
            {action.shortcut.map((sc) => (
              <kbd
                key={sc}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-md text-sm"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    )
  },
)

export default MyApp
