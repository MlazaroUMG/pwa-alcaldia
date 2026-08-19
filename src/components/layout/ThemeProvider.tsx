import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

import { ThemeContext, type Theme } from "@/hooks/use-theme"

const THEME_STORAGE_KEY = "pwa-alcaldia-theme"

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Application-wide light/dark theme provider.
 *
 * Persists the chosen theme in `localStorage` and toggles the `dark` class
 * on the document root, which the color tokens in `App.css` already react
 * to. Scoped at the app level so the toggle exposed in the admin dashboard
 * applies consistently across a browser session.
 *
 * @component
 * @module Layout
 * @param {ThemeProviderProps} props Children to render within the provider.
 * @returns {JSX.Element} Context provider for the current theme.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    // Deferred so the state update from a stored preference does not run
    // synchronously within the effect body (avoids a cascading render).
    const bootstrapTimer = window.setTimeout(() => {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
      if (storedTheme === "dark" || storedTheme === "light") {
        setTheme(storedTheme)
      }
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((previous: Theme) => (previous === "dark" ? "light" : "dark")),
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
