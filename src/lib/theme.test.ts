import { describe, expect, it } from "vitest"

import { persistTheme, readStoredTheme, THEME_STORAGE_KEY } from "@/lib/theme"

function createMemoryStorage(initial?: Record<string, string>) {
  const store = new Map<string, string>(Object.entries(initial ?? {}))

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
}

describe("persistencia de tema", () => {
  it("lee el tema guardado sin asumir claro", () => {
    const storage = createMemoryStorage({ [THEME_STORAGE_KEY]: "dark" })
    expect(readStoredTheme(storage)).toBe("dark")
  })

  it("usa claro cuando no hay preferencia válida", () => {
    expect(readStoredTheme(createMemoryStorage())).toBe("light")
    expect(readStoredTheme(createMemoryStorage({ [THEME_STORAGE_KEY]: "blue" }))).toBe("light")
  })

  it("persiste solo el valor elegido", () => {
    const storage = createMemoryStorage()
    persistTheme("dark", storage)
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe("dark")
  })
})
