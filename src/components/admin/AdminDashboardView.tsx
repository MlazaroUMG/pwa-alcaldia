import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Inbox,
  LayoutList,
  Megaphone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface AdminDashboardViewProps {
  onNavigate: (section: "inbox" | "management" | "board" | "resolved" | "wall") => void
}

interface DashboardIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
  is_public: boolean
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  Pendiente: "Recibido",
  "En Progreso": "En proceso",
  Resuelto: "Resuelto",
}

const STATUS_STYLES: Record<IncidentStatus, string> = {
  Pendiente: "bg-blue-50 text-blue-600",
  "En Progreso": "bg-amber-50 text-amber-600",
  Resuelto: "bg-green-50 text-green-600",
}

/**
 * Real-data administrative dashboard.
 *
 * Mirrors the reference dashboard cards and summaries while deriving every
 * count from Supabase incidents. It intentionally maps mockup labels to the
 * persisted incident status contract without adding a new priority column.
 *
 * @component
 * @module Admin
 */
export function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  const [incidents, setIncidents] = useState<DashboardIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const loadDashboard = async () => {
        const { data, error } = await supabase
          .from("incidents")
          .select("id,title,category,status,created_at,is_public")
          .order("created_at", { ascending: false })

        if (error) {
          setErrorMessage(error.message)
          setIsLoading(false)
          return
        }

        setIncidents((data ?? []) as DashboardIncident[])
        setErrorMessage(null)
        setIsLoading(false)
      }

      void loadDashboard()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  const summary = useMemo(() => {
    return incidents.reduce(
      (accumulator, incident) => {
        accumulator.total += 1
        accumulator.byStatus[incident.status] += 1
        if (incident.status === "Pendiente") {
          accumulator.pending += 1
        }
        if (incident.is_public) {
          accumulator.publicResolved += 1
        }
        return accumulator
      },
      {
        total: 0,
        pending: 0,
        publicResolved: 0,
        byStatus: {
          Pendiente: 0,
          "En Progreso": 0,
          Resuelto: 0,
        } satisfies Record<IncidentStatus, number>,
      }
    )
  }, [incidents])

  const stats = [
    {
      label: "Total Incidencias",
      value: summary.total,
      icon: LayoutList,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Recibidas",
      value: summary.byStatus.Pendiente,
      icon: Inbox,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "En proceso",
      value: summary.byStatus["En Progreso"],
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pendientes críticas",
      value: summary.pending,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Resueltas",
      value: summary.byStatus.Resuelto,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ]

  const recentIncidents = incidents.slice(0, 5)

  return (
    <section className="flex-1 overflow-y-auto bg-[#f7f9fc] p-6 dark:bg-[#0d0b45]">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-indigo-200">
            Resumen del sistema de gestión de incidencias
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a]"
            >
              <div
                className={`mb-3 flex size-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isLoading ? "..." : stat.value}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-indigo-200">
                {stat.label}
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a] xl:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-indigo-900">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Incidencias recientes
              </h2>
              <button
                type="button"
                onClick={() => onNavigate("management")}
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-500 hover:text-indigo-700"
              >
                Ver todas
                <ArrowRight className="size-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-indigo-900">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-indigo-950/30"
                >
                  <span className="w-20 shrink-0 truncate font-mono text-xs text-gray-400">
                    {incident.id.slice(0, 8)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                      {incident.title}
                    </div>
                    <div className="text-xs text-gray-400">{incident.category}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[incident.status]
                    }`}
                  >
                    {STATUS_LABELS[incident.status]}
                  </span>
                </div>
              ))}

              {!isLoading && recentIncidents.length === 0 && (
                <p className="px-6 py-6 text-sm text-gray-500">
                  No hay incidencias registradas.
                </p>
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a]">
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Por estado
            </h2>
            <div className="space-y-3">
              {(Object.keys(summary.byStatus) as IncidentStatus[]).map((status) => {
                const count = summary.byStatus[status]
                const percentage =
                  summary.total > 0 ? Math.round((count / summary.total) * 100) : 0

                return (
                  <div key={status}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-indigo-200">
                        {STATUS_LABELS[status]}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-indigo-950">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 border-t border-gray-50 pt-4 dark:border-indigo-900">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-indigo-200">
                Acciones rápidas
              </h3>
              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full justify-start rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
                  onClick={() => onNavigate("management")}
                >
                  Ver lista de tickets
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => onNavigate("board")}
                >
                  Abrir tablero Kanban
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start rounded-xl"
                  onClick={() => onNavigate("wall")}
                >
                  <Megaphone className="size-4" />
                  Gestionar muro público
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
