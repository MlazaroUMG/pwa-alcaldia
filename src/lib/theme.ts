export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "pwa-alcaldia-theme"

/**
 * Lee la preferencia persistida. Si no hay valor válido, usa el tema claro.
 */
export function readStoredTheme(
  storage: Pick<Storage, "getItem"> | null = typeof window === "undefined"
    ? null
    : window.localStorage
): Theme {
  if (!storage) {
    return "light"
  }

  try {
    const storedTheme = storage.getItem(THEME_STORAGE_KEY)
    return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light"
  } catch {
    return "light"
  }
}

/**
 * Persiste el tema elegido por la persona usuaria.
 */
export function persistTheme(
  theme: Theme,
  storage: Pick<Storage, "setItem"> | null = typeof window === "undefined"
    ? null
    : window.localStorage
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage puede no estar disponible.
  }
}

export function applyThemeClass(theme: Theme, root: Element | null = null) {
  const documentRoot =
    root ?? (typeof document === "undefined" ? null : document.documentElement)

  if (!documentRoot) {
    return
  }

  documentRoot.classList.toggle("dark", theme === "dark")
}
