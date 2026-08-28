import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Bot,
  ClipboardList,
  House,
  Megaphone,
  Moon,
  PlusCircle,
} from "lucide-react"

import { CommunityBoard } from "@/components/citizen/CommunityBoard"
import { IncidentSubmissionForm } from "@/components/citizen/IncidentSubmissionForm"
import { MyCasesView } from "@/components/citizen/MyCasesView"
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView"
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
  dependency: string | null
  call_type_code: number | null
  call_type_label: string | null
  resolution_summary: string | null
  image_url: string | null
  resolved_at: string | null
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
            .order("created_at", { ascending: false }),
          supabase
            .from("incidents")
            .select("category,dependency,call_type_code,call_type_label,resolution_summary,image_url,resolved_at")
            .eq("is_public", true)
            .eq("status", "Resuelto")
            .order("resolved_at", { ascending: false })
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
        <p className="text-xs uppercase tracking-wider text-indigo-300">Bienvenido</p>
        <h1 className="font-display mt-0.5 text-2xl font-bold text-gray-100">
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
          className="rounded-2xl border border-[#2a278f] bg-[#1e1b7a] p-4 text-left transition-all hover:border-indigo-300 hover:shadow-sm"
        >
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-indigo-950">
            <ClipboardList className="size-5 text-indigo-300" />
          </div>
          <div className="text-sm font-semibold text-gray-100">Mis Tickets</div>
          <div className="mt-0.5 text-xs text-indigo-400">Ver seguimiento</div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#2a278f] bg-[#1e1b7a] p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{counts.active}</div>
          <div className="mt-0.5 text-xs text-indigo-400">Activos</div>
        </div>
        <div className="rounded-xl border border-[#2a278f] bg-[#1e1b7a] p-3 text-center">
          <div className="text-xl font-bold text-green-400">{counts.resolved}</div>
          <div className="mt-0.5 text-xs text-indigo-400">Resueltos</div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">Muro Comunitario</h2>
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
          className="w-full overflow-hidden rounded-2xl border border-[#2a278f] bg-[#1e1b7a] text-left"
        >
          {communityPreview?.image_url && (
            <img
              src={communityPreview.image_url}
              alt={`Resolución comunitaria de ${communityPreview.category}`}
              className="h-36 w-full object-cover"
            />
          )}
          {!communityPreview?.image_url && (
            <div className="h-36 bg-gradient-to-br from-green-50 to-emerald-100" />
          )}
          <div className="p-3">
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Resuelto
            </span>
            <h3 className="mt-1 text-sm font-semibold text-gray-100">
              {communityPreview
                ? `Resolución de ${communityPreview.category}`
                : "Sin publicaciones recientes"}
            </h3>
            {communityPreview && (
              <p className="mt-1 line-clamp-1 text-xs text-indigo-300">
                {communityPreview.dependency ?? "Sin dependencia"}
              </p>
            )}
            {communityPreview?.call_type_code && communityPreview.call_type_label && (
              <p className="mt-0.5 line-clamp-1 text-xs text-indigo-300">
                {`${communityPreview.call_type_code} - ${communityPreview.call_type_label}`}
              </p>
            )}
            <p className="mt-1 line-clamp-2 text-xs text-indigo-300">
              {communityPreview?.resolution_summary ??
                "Las resoluciones públicas aparecerán aquí cuando sean aprobadas."}
            </p>
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-purple-800 bg-purple-900/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-900/40">
            <Bot className="size-4 text-purple-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-purple-300">
              Detección inteligente
            </div>
            <div className="mt-0.5 text-xs text-purple-400">
              Próximamente: apoyo para detectar reportes duplicados antes de
              saturar el sistema.
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
  const initials = email?.charAt(0).toUpperCase() ?? "C"
  const { toggleTheme } = useTheme()

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[448px] flex-col bg-[#0d0b45] text-gray-100">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[#2a278f] bg-[#1e1b7a] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-white">
              <img
                src="/logo.png"
                alt="Alcaldía Auxiliar Zona 18"
                className="size-8 object-contain"
              />
            </div>
            <span className="font-display text-sm font-bold text-gray-100">CiudadApp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title="Cambiar apariencia"
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-indigo-300 transition-colors hover:bg-indigo-900"
            >
              <Moon className="size-4" />
            </button>
            <button
              type="button"
              title="Notificaciones"
              className="relative rounded-lg p-1.5 text-indigo-300 transition-colors hover:bg-indigo-900"
            >
              <Bell className="size-[18px]" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              onClick={() => setSection("profile")}
              className="flex size-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
              aria-label="Abrir perfil"
            >
              {initials}
            </button>
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
          <MyCasesView userId={userId} onBack={() => setSection("home")} />
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

      <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-[448px] -translate-x-1/2 grid-cols-4 border-t border-[#2a278f] bg-[#1e1b7a] py-2">
          <button
            type="button"
            onClick={() => setSection("home")}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-xs font-medium transition-colors",
              section === "home" ? "text-indigo-300" : "text-indigo-500 hover:text-indigo-300"
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
              section === "report" ? "text-indigo-300" : "text-indigo-500 hover:text-indigo-300"
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
              section === "cases" ? "text-indigo-300" : "text-indigo-500 hover:text-indigo-300"
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
              section === "wall" ? "text-indigo-300" : "text-indigo-500 hover:text-indigo-300"
            )}
          >
            <Megaphone className="size-5" />
            Comunidad
          </button>
      </nav>
    </div>
  )
}
