import { Settings, LogOut } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserAvatarMenuProps {
  email?: string
  onSignOut: () => void
  /** Opens the profile view when provided; hidden shells may omit this. */
  onOpenProfile?: () => void
}

/**
 * Shared user avatar menu for citizen and admin shells.
 *
 * Provides quick access to profile settings and secure sign-out actions.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Compact avatar trigger with dropdown actions.
 */
export function UserAvatarMenu({ email, onSignOut, onOpenProfile }: UserAvatarMenuProps) {
  const initials = email?.slice(0, 2).toUpperCase() ?? "US"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          aria-label="Abrir menú de usuario"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{email ?? "Usuario autenticado"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenProfile} disabled={!onOpenProfile}>
          <Settings className="size-4" />
          Ajustes de perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
