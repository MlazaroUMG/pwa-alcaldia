import type { ReactNode } from "react"

interface AuthLightShellProps {
  children: ReactNode
}

/**
 * Fuerza la paleta clara de autenticación aunque el `html` tenga clase `dark`.
 *
 * Las pantallas de acceso no exponen el interruptor de tema.
 *
 * @component
 * @module Auth
 */
export function AuthLightShell({ children }: AuthLightShellProps) {
  return (
    <div className="min-h-screen bg-[#edf3fb] text-gray-900 dark:bg-[#edf3fb] dark:text-gray-900">
      {children}
    </div>
  )
}
