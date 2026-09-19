import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"

import { ThemeContext, type Theme } from "@/hooks/use-theme"
import { applyThemeClass, persistTheme, readStoredTheme } from "@/lib/theme"

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Application-wide light/dark theme provider.
 *
 * Lee `localStorage` de forma síncrona al montar para no sobrescribir la
 * preferencia guardada con el valor por defecto. La persistencia solo corre
 * cuando la persona usuaria cambia el tema.
 *
 * @component
 * @module Layout
 * @param {ThemeProviderProps} props Children to render within the provider.
 * @returns {JSX.Element} Context provider for the current theme.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme())
  const hasUserChangedTheme = useRef(false)

  useEffect(() => {
    applyThemeClass(theme)
    if (hasUserChangedTheme.current) {
      persistTheme(theme)
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        hasUserChangedTheme.current = true
        setTheme((previous: Theme) => (previous === "dark" ? "light" : "dark"))
      },
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
