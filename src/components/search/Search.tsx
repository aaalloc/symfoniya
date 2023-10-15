/* eslint-disable react/display-name */
import {
  ActionId,
  ActionImpl,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarResults,
  KBarSearch,
  useMatches,
  useRegisterActions,
} from "kbar"
import { HomeIcon, Moon, Sun, SunMoon } from "lucide-react"
import { useRouter } from "next/router"
import { useTheme } from "next-themes"
import * as React from "react"

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
}

export function Search() {
  const { setTheme } = useTheme()
  const history = useRouter()
  const initialActions = [
    {
      id: "homeAction",
      name: "Home",
      shortcut: ["h"],
      keywords: "back",
      section: "Navigation",
      perform: () => history.push("/"),
      icon: <HomeIcon />,
      priority: 3,
    },
    {
      id: "themeAction",
      name: "Change theme",
      shortcut: ["t"],
      keywords: "theme",
      section: "Preferences",
      icon: <SunMoon />,
      priority: 1,
    },
    {
      id: "darkTheme",
      name: "Dark",
      keywords: "dark theme",
      section: "",
      perform: () => {
        setTheme("dark")
      },
      parent: "themeAction",
      icon: <Moon />,
    },
    {
      id: "lightTheme",
      name: "Light",
      keywords: "light theme",
      section: "",
      perform: () => {
        setTheme("light")
      },
      parent: "themeAction",
      icon: <Sun />,
    },
  ]

  useRegisterActions(initialActions)
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

function RenderResults() {
  const { results, rootActionId } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className="bg-background" style={groupNameStyle}>
            {item}
          </div>
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
