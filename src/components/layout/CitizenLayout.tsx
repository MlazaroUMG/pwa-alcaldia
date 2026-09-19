import { useEffect, useMemo, useState } from "react"
import {
  Bot,
  ClipboardList,
  House,
  Megaphone,
  Moon,
  PlusCircle,
  Sun,
} from "lucide-react"

import { CommunityBoard } from "@/components/citizen/CommunityBoard"
import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import { MyCasesView } from "@/components/citizen/MyCasesView"
import { BrandLogo } from "@/components/layout/BrandLogo"
import { NotificationsMenu } from "@/components/layout/NotificationsMenu"
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView"
import { UserAvatarMenu } from "@/components/layout/UserAvatarMenu"
import { SignedPhoto } from "@/components/media/SignedPhoto"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

type CitizenSection = "home" | "report" | "cases" | "wall" | "profile"

interface CitizenLayoutProps {
  userId: string
  email?: string
  onSignOut: () => void
}

interface CitizenHomeProps {
  userId: string
  email?: string
  onNavigate: (section: CitizenSection) => void
}

interface CitizenProfile {
  first_name: string | null
  last_name: string | null
}

interface CitizenIncidentSummary {
  id: string
  title: string
  status: IncidentStatus
}

interface CommunityPreview {
  category: string
  resolution_summary: string | null
  resolution_image_url: string | null
  resolved_at: string | null
  published_at: string | null
}

function getDisplayName(profile: CitizenProfile | null, email?: string) {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
  return fullName || email?.split("@")[0] || "Ciudadano"
}

/**
 * Citizen dashboard home fed by the authenticated user's real data.
 *
 * Shows quick actions, local ticket counts and a sanitized community wall
 * preview without using mock records from the visual reference.
 *
 * @component
 * @module Layout
 */
function CitizenHome({ userId, email, onNavigate }: CitizenHomeProps) {
  const [profile, setProfile] = useState<CitizenProfile | null>(null)
  const [incidents, setIncidents] = useState<CitizenIncidentSummary[]>([])
  const [communityPreview, setCommunityPreview] = useState<CommunityPreview | null>(null)

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const loadHomeData = async () => {
        const [profileResult, incidentsResult, communityResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("first_name,last_name")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("incidents")
            .select("id,title,status")
            .eq("user_id", userId)
            .is("discarded_at", null)
            .order("created_at", { ascending: false }),
          supabase
            .rpc("get_community_board")
            .limit(1)
            .maybeSingle(),
        ])

        setProfile((profileResult.data ?? null) as CitizenProfile | null)
        setIncidents((incidentsResult.data ?? []) as CitizenIncidentSummary[])
        setCommunityPreview((communityResult.data ?? null) as CommunityPreview | null)
      }

      void loadHomeData()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [userId])

  const counts = useMemo(() => {
    return incidents.reduce(
      (accumulator, incident) => {
        if (incident.status === "Resuelto") {
          accumulator.resolved += 1
        } else {
          accumulator.active += 1
        }
        return accumulator
      },
      { active: 0, resolved: 0 }
    )
  }, [incidents])

  return (
    <div className="space-y-5 px-4 py-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground dark:text-indigo-300">Bienvenido</p>
        <h1 className="font-display mt-0.5 text-2xl font-bold text-foreground">
          {getDisplayName(profile, email)}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate("report")}
          className="rounded-2xl bg-indigo-500 p-4 text-left text-white shadow-sm transition-colors hover:bg-indigo-600"
        >
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white/20">
            <PlusCircle className="size-5" />
          </div>
          <div className="text-sm font-semibold">Reportar</div>
          <div className="mt-0.5 text-xs text-white/70">Nueva incidencia</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("cases")}
          className="rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-indigo-300 hover:shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a]"
        >
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
            <ClipboardList className="size-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div className="text-sm font-semibold text-foreground">Mis Tickets</div>
          <div className="mt-0.5 text-xs text-muted-foreground dark:text-indigo-400">Ver seguimiento</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center dark:border-[#2a278f] dark:bg-[#1e1b7a]">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{counts.active}</div>
          <div className="mt-0.5 text-xs text-muted-foreground dark:text-indigo-400">Activos</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center dark:border-[#2a278f] dark:bg-[#1e1b7a]">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{counts.resolved}</div>
          <div className="mt-0.5 text-xs text-muted-foreground dark:text-indigo-400">Resueltos</div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Muro Comunitario</h2>
          <button
            type="button"
            onClick={() => onNavigate("wall")}
            className="text-xs font-medium text-indigo-400"
          >
            Ver todo
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("wall")}
          className="w-full overflow-hidden rounded-2xl border border-border bg-card text-left dark:border-[#2a278f] dark:bg-[#1e1b7a]"
        >
          {communityPreview?.resolution_image_url ? (
            <SignedPhoto
              path={communityPreview.resolution_image_url}
              alt={`Resolución comunitaria de ${communityPreview.category}`}
              className="h-36 w-full object-cover"
            />
          ) : (
            <div className="h-36 bg-gradient-to-br from-green-50 to-emerald-100" />
          )}
          <div className="p-3">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Resuelto
            </span>
            <h3 className="mt-1 text-sm font-semibold text-foreground">
              {communityPreview
                ? `Resolución de ${communityPreview.category}`
                : "Sin publicaciones recientes"}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground dark:text-indigo-300">
              {communityPreview?.resolution_summary ??
                "Las resoluciones públicas aparecerán aquí cuando sean aprobadas."}
            </p>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-900/40">
            <Bot className="size-4 text-purple-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-300">
              Detección inteligente
            </div>
            <div className="mt-0.5 text-xs text-purple-400">
              Antes de enviar, se buscan reportes abiertos similares y cercanos.
              La decisión final siempre es del ciudadano.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
  const [highlightIncidentId, setHighlightIncidentId] = useState<string | null>(null)
  const [profile, setProfile] = useState<CitizenProfile | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", userId)
        .maybeSingle()

      setProfile((data ?? null) as CitizenProfile | null)
    }

    void loadProfile()
  }, [userId])

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col overflow-x-hidden bg-background text-foreground dark:bg-[#0d0b45] dark:text-gray-100">
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-card px-4 py-3 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="size-9 rounded-lg border-gray-100" />
            <span className="font-display text-sm font-bold text-foreground">PWA Alcaldia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Cambiar apariencia"
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted dark:text-indigo-300 dark:hover:bg-indigo-900"
            >
              {theme === "dark" ? (
                <Sun className="size-4 text-gray-100" />
              ) : (
                <Moon className="size-4 text-gray-700" />
              )}
            </button>
            <NotificationsMenu
              variant="citizen"
              onSelect={(notification) => {
                if (notification.type === "wall_published") {
                  setSection("wall")
                  return
                }

                setHighlightIncidentId(notification.incident_id)
                setSection("cases")
              }}
            />
            <UserAvatarMenu
              email={email}
              firstName={profile?.first_name}
              lastName={profile?.last_name}
              onSignOut={onSignOut}
              onOpenProfile={() => setSection("profile")}
            />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto pb-24">
        {section === "home" && (
          <CitizenHome userId={userId} email={email} onNavigate={setSection} />
        )}
        {section === "report" && (
          <IncidentSubmissionForm userId={userId} onBack={() => setSection("home")} />
        )}
        {section === "cases" && (
          <MyCasesView
            userId={userId}
            highlightIncidentId={highlightIncidentId}
            onBack={() => setSection("home")}
          />
        )}
        {section === "wall" && <CommunityBoard onBack={() => setSection("home")} />}
        {section === "profile" && (
          <div className="space-y-3 px-4 py-5">
            <ProfileSettingsView email={email} layout="citizen" />
            <Button
              type="button"
              variant="destructive"
              className="w-full rounded-xl"
              onClick={onSignOut}
            >
              Cerrar sesión
            </Button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[448px] -translate-x-1/2 grid-cols-4 border-t border-border bg-card py-2 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
          <button
            type="button"
            onClick={() => setSection("home")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium transition-colors",
              section === "home" ? "text-primary dark:text-indigo-300" : "text-muted-foreground hover:text-primary dark:text-indigo-500 dark:hover:text-indigo-300"
            )}
          >
            <House className="size-5" />
            Inicio
          </button>
          <button
            type="button"
            onClick={() => setSection("report")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium transition-colors",
              section === "report" ? "text-primary dark:text-indigo-300" : "text-muted-foreground hover:text-primary dark:text-indigo-500 dark:hover:text-indigo-300"
            )}
          >
            <div
              className={cn(
                "-mt-6 flex size-12 items-center justify-center rounded-2xl text-white shadow-lg",
                section === "report" ? "bg-indigo-600" : "bg-indigo-500"
              )}
            >
              <PlusCircle className="size-5" />
            </div>
            <span className="mt-1">Reportar</span>
          </button>
          <button
            type="button"
            onClick={() => setSection("cases")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium transition-colors",
              section === "cases" ? "text-primary dark:text-indigo-300" : "text-muted-foreground hover:text-primary dark:text-indigo-500 dark:hover:text-indigo-300"
            )}
          >
            <ClipboardList className="size-5" />
            Mis tickets
          </button>
          <button
            type="button"
            onClick={() => setSection("wall")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium transition-colors",
              section === "wall" ? "text-primary dark:text-indigo-300" : "text-muted-foreground hover:text-primary dark:text-indigo-500 dark:hover:text-indigo-300"
            )}
          >
            <Megaphone className="size-5" />
            Comunidad
          </button>
      </nav>
    </div>
  )
}
