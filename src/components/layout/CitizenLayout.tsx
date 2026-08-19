import { useState } from "react"
import { ClipboardList, House, MessageSquareMore } from "lucide-react"

import { CommunityBoard } from "@/components/citizen/CommunityBoard"
import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import { MyCasesView } from "@/components/citizen/MyCasesView"
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu"
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView"
import { cn } from "@/lib/utils"

type CitizenSection = "home" | "cases" | "wall" | "profile"

interface CitizenLayoutProps {
  userId: string
  email?: string
  onSignOut: () => void
}

/**
 * Mobile-first shell for citizen operations in the PWA.
 *
 * Provides the required municipal top app bar, profile dropdown, and a fixed
 * bottom navigation for quick access to report submission, personal cases, and
 * public wall updates.
 *
 * @component
 * @module Layout
 * @returns {JSX.Element} Citizen module layout with app-bar and bottom nav.
 */
export function CitizenLayout({ userId, email, onSignOut }: CitizenLayoutProps) {
  const [section, setSection] = useState<CitizenSection>("home")

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-muni-blue text-white shadow-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Alcaldía Auxiliar Zona 18" className="h-11 w-auto" />
            <div>
              <p className="text-lg font-bold leading-tight">MuniReporte</p>
              <p className="text-xs text-white/90">Pinares del norte Distrito IV</p>
            </div>
          </div>
          <UserAvatarMenu
            email={email}
            onSignOut={onSignOut}
            onOpenProfile={() => setSection("profile")}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-4">
        {section === "home" && <IncidentSubmissionForm userId={userId} />}
        {section === "cases" && <MyCasesView userId={userId} />}
        {section === "wall" && <CommunityBoard />}
        {section === "profile" && (
          <ProfileSettingsView email={email} layout="citizen" />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-3">
          <button
            type="button"
            onClick={() => setSection("home")}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium",
              section === "home" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <House className="size-5" />
            Inicio
          </button>
          <button
            type="button"
            onClick={() => setSection("cases")}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium",
              section === "cases" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <ClipboardList className="size-5" />
            Mis casos
          </button>
          <button
            type="button"
            onClick={() => setSection("wall")}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium",
              section === "wall" ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessageSquareMore className="size-5" />
            Muro público
          </button>
        </div>
      </nav>
    </div>
  )
}
