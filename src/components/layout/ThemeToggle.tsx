import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

interface ThemeToggleProps {
  className?: string
}

/**
 * Light/dark mode toggle for the administrative dashboard.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Icon button that switches the active theme.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label="Cambiar modo claro/oscuro"
      onClick={toggleTheme}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
