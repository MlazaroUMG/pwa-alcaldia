import { useState } from "react"
import type { ComponentType } from "react"
import {
  CheckCheck,
  CircleHelp,
  Columns3,
  Inbox,
  LayoutDashboard,
  LayoutList,
  Megaphone,
  SlidersHorizontal,
} from "lucide-react"

import { AdminCommunityWallView } from "@/components/admin/AdminCommunityWallView"
import { AdminDashboardView } from "@/components/admin/AdminDashboardView"
import { AdminInboxView } from "@/components/admin/AdminInboxView"
import { AdminResolvedView } from "@/components/admin/AdminResolvedView"
import { AdminTicketTable } from "@/components/admin/AdminTicketTable"
import { AdminTicketsBoardView } from "@/components/admin/AdminTicketsBoardView"
import { NotificationsMenu } from "@/components/layout/NotificationsMenu"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu"
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AdminSection =
  | "dashboard"
  | "inbox"
  | "management"
  | "board"
  | "resolved"
  | "wall"
  | "profile"

interface AdminLayoutProps {
  email?: string
  onSignOut: () => void
}

interface AdminNavItem {
  key: AdminSection
  label: string
  icon: ComponentType<{ className?: string }>
}

const NAV_ITEMS: AdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "inbox", label: "Bandeja", icon: Inbox },
  { key: "management", label: "Incidencias", icon: LayoutList },
  { key: "board", label: "Tablero", icon: Columns3 },
  { key: "resolved", label: "Resueltos", icon: CheckCheck },
  { key: "wall", label: "Muro Público", icon: Megaphone },
]

/**
 * Desktop-first operations shell for municipal administrators.
 *
 * Adopts the shadcn-admin reference structure with a compact fixed sidebar,
 * light/dark mode toggle, and an account profile view around the previously
 * built ticket triage, management, resolution, and public wall moderation
 * modules. Navigation stays state-driven and the content area uses the full
 * remaining viewport width.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Sidebar-based admin workspace with contextual tools.
 */
export function AdminLayout({ email, onSignOut }: AdminLayoutProps) {
  const [section, setSection] = useState<AdminSection>("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyPending, setOnlyPending] = useState(false)
  const [highlightIncidentId, setHighlightIncidentId] = useState<string | null>(null)

  const showSearchBar = section === "inbox"

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#f7f9fc] dark:bg-[#0d0b45]">
      <aside className="flex h-screen w-[72px] shrink-0 flex-col bg-[#151357]">
        <div className="flex h-[72px] shrink-0 items-center justify-center">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-[#2a278f] bg-white">
            <img
              src="/logo.png"
              alt="Alcaldía Auxiliar Zona 18"
              className="size-9 object-contain"
            />
          </div>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = section === item.key
            return (
              <button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex size-10 items-center justify-center rounded-xl transition-all duration-150 ${
                  isActive
                    ? "border border-[#2a278f] bg-[#0d0b45] text-[#97d700]"
                    : "text-[#6b6fa8] hover:bg-[#1e1b7a] hover:text-white"
                }`}
                onClick={() => setSection(item.key)}
              >
                <item.icon className="size-5" />
              </button>
            )
          })}
        </nav>

        <div className="flex h-16 shrink-0 items-center justify-center">
          <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
            {email?.charAt(0).toUpperCase() ?? "A"}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
          <div className="flex min-w-0 items-center gap-2">
            {showSearchBar && (
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <Input
                  type="search"
                  placeholder="Buscar ticket ID, zona..."
                  className="w-full rounded-xl border-gray-200 sm:max-w-md"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <Button
                  variant={onlyPending ? "default" : "outline"}
                  className={onlyPending ? "bg-muni-lightblue text-sky-950 hover:bg-muni-lightblue/90" : ""}
                  onClick={() => setOnlyPending((previous) => !previous)}
                >
                  <SlidersHorizontal className="size-4" />
                  Filtros
                </Button>
              </div>
            )}
            {!showSearchBar && (
              <span className="truncate font-mono text-xs uppercase tracking-wider text-gray-400 dark:text-indigo-300">
                Sistema de Gestión de Incidencias
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationsMenu
              variant="admin"
              onSelect={(notification) => {
                setSection("inbox")
                setHighlightIncidentId(notification.incident_id)
              }}
            />
            <button
              type="button"
              aria-label="Ayuda"
              className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-indigo-300 dark:hover:bg-indigo-900"
            >
              <CircleHelp className="size-[18px]" />
            </button>
            <ThemeToggle />
            <UserAvatarMenu
              email={email}
              onSignOut={onSignOut}
              onOpenProfile={() => setSection("profile")}
            />
          </div>
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {section === "dashboard" && (
            <AdminDashboardView onNavigate={(nextSection) => setSection(nextSection)} />
          )}
          {section === "inbox" && (
            <AdminInboxView
              searchQuery={searchQuery}
              onlyPending={onlyPending}
              highlightIncidentId={highlightIncidentId}
            />
          )}
          {section === "management" && <AdminTicketTable />}
          {section === "board" && <AdminTicketsBoardView />}
          {section === "resolved" && <AdminResolvedView />}
          {section === "wall" && <AdminCommunityWallView />}
          {section === "profile" && (
            <ProfileSettingsView email={email} layout="admin" />
          )}
        </main>
      </div>
    </div>
  )
}
