import { useState } from "react"
import type { ComponentType } from "react"
import { CheckCheck, Inbox, LayoutList, Megaphone, SlidersHorizontal } from "lucide-react"

import { AdminCommunityWallView } from "@/components/admin/AdminCommunityWallView"
import { AdminInboxView } from "@/components/admin/AdminInboxView"
import { AdminResolvedView } from "@/components/admin/AdminResolvedView"
import { AdminTicketTable } from "@/components/admin/AdminTicketTable"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu"
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type AdminSection = "inbox" | "management" | "resolved" | "wall" | "profile"

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
  { key: "inbox", label: "Bandeja de Entrada", icon: Inbox },
  { key: "management", label: "Gestión", icon: LayoutList },
  { key: "resolved", label: "Resueltos", icon: CheckCheck },
  { key: "wall", label: "Muro Comunitario", icon: Megaphone },
]

/**
 * Desktop-first operations shell for municipal administrators.
 *
 * Adopts the shadcn-admin reference structure — a collapsible sidebar,
 * light/dark mode toggle, and an account profile view — around the
 * previously built ticket triage, management, resolution, and public wall
 * moderation modules. Navigation stays state-driven (no router) and the
 * content area never overflows the viewport horizontally.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Sidebar-based admin workspace with contextual tools.
 */
export function AdminLayout({ email, onSignOut }: AdminLayoutProps) {
  const [section, setSection] = useState<AdminSection>("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyPending, setOnlyPending] = useState(false)

  const showSearchBar = section === "inbox" || section === "management"

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
            <img
              src="/logo.png"
              alt="Alcaldía Auxiliar Zona 18"
              className="size-9 shrink-0 rounded object-contain group-data-[collapsible=icon]:size-7"
            />
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-bold leading-tight text-sidebar-foreground">
                Admin Portal
              </p>
              <p className="text-xs text-sidebar-foreground/80">Alcaldía Auxiliar</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={section === item.key}
                      tooltip={item.label}
                      onClick={() => setSection(item.key)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <p className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            Zona 18, Ciudad de Guatemala
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex min-w-0 flex-col gap-3 border-b bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            {showSearchBar && (
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <Input
                  type="search"
                  placeholder="Buscar ticket ID, zona..."
                  className="w-full sm:max-w-md"
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
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserAvatarMenu
              email={email}
              onSignOut={onSignOut}
              onOpenProfile={() => setSection("profile")}
            />
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          {section === "inbox" && (
            <AdminInboxView searchQuery={searchQuery} onlyPending={onlyPending} />
          )}
          {section === "management" && <AdminTicketTable />}
          {section === "resolved" && <AdminResolvedView />}
          {section === "wall" && <AdminCommunityWallView />}
          {section === "profile" && (
            <ProfileSettingsView email={email} layout="admin" />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
