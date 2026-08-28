import { useEffect, useMemo, useState } from "react"
import {
  FileText,
  Filter,
  Grid2X2,
  Plus,
  Search,
  UserRound,
} from "lucide-react"

import { ResolveIncidentDialog } from "@/components/admin/ResolveIncidentDialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface BoardIncident {
  id: string
  title: string
  description: string
  category: string
  dependency: string | null
  call_type_code: number | null
  call_type_label: string | null
  status: IncidentStatus
  created_at: string
  image_url: string | null
}

const COLUMNS: Array<{
  status: IncidentStatus
  label: string
  color: string
  accent: string
}> = [
  { status: "Pendiente", label: "Recibido", color: "bg-blue-500", accent: "bg-blue-500" },
  {
    status: "En Progreso",
    label: "En proceso",
    color: "bg-amber-500",
    accent: "bg-amber-500",
  },
  { status: "Resuelto", label: "Resuelto", color: "bg-green-500", accent: "bg-green-500" },
]

function getPriority(incident: BoardIncident) {
  if (incident.status === "Pendiente") {
    return { label: "Media", className: "bg-amber-50 text-amber-600" }
  }

  if (incident.status === "En Progreso") {
    return { label: "Alta", className: "bg-orange-50 text-orange-600" }
  }

  return { label: "Alta", className: "bg-orange-50 text-orange-600" }
}

interface TicketCardProps {
  incident: BoardIncident
  onMoveForward: (incident: BoardIncident) => void
}

function TicketCard({ incident, onMoveForward }: TicketCardProps) {
  const priority = getPriority(incident)
  const nextAction =
    incident.status === "Pendiente"
      ? "Mover a proceso"
      : incident.status === "En Progreso"
        ? "Resolver"
        : null

  return (
    <article className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a278f] dark:bg-[#1e1b7a]">
      <div className="mb-2 flex items-start justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}>
          {priority.label}
        </span>
        {nextAction && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 rounded-lg px-2 text-xs text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
            onClick={() => onMoveForward(incident)}
          >
            {nextAction}
          </Button>
        )}
      </div>

      <h3 className="mb-1 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
        {incident.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-xs text-gray-400">{incident.description}</p>

      {incident.image_url && (
        <img
          src={incident.image_url}
          alt={`Evidencia de ${incident.title}`}
          className="mb-3 h-28 w-full rounded-lg object-cover"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <FileText className="size-3 shrink-0" />
            <span className="truncate">{incident.category}</span>
          </div>
          <p className="line-clamp-1">{incident.dependency ?? "Sin dependencia"}</p>
          <p className="line-clamp-1">
            {incident.call_type_code && incident.call_type_label
              ? `${incident.call_type_code} - ${incident.call_type_label}`
              : "Sin tipo de llamada"}
          </p>
        </div>
        <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-gray-200">
          <UserRound className="size-3 text-gray-400" />
        </div>
      </div>
    </article>
  )
}

/**
 * Kanban board for administrative status transitions.
 *
 * Keeps the persisted workflow explicit: `Pendiente` can move to
 * `En Progreso`, and `En Progreso` can move to `Resuelto` through the
 * resolution curation dialog that controls public wall publication.
 *
 * @component
 * @module Admin
 */
export function AdminTicketsBoardView() {
  const [incidents, setIncidents] = useState<BoardIncident[]>([])
  const [search, setSearch] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resolvingIncident, setResolvingIncident] = useState<BoardIncident | null>(null)
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const loadBoard = async () => {
        const { data, error } = await supabase
          .from("incidents")
          .select("id,title,description,category,dependency,call_type_code,call_type_label,status,created_at,image_url")
          .order("created_at", { ascending: false })

        if (error) {
          setErrorMessage(error.message)
          return
        }

        setIncidents((data ?? []) as BoardIncident[])
        setErrorMessage(null)
      }

      void loadBoard()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return incidents.filter(
      (incident) =>
        normalizedSearch.length === 0 ||
        incident.title.toLowerCase().includes(normalizedSearch) ||
        incident.category.toLowerCase().includes(normalizedSearch) ||
        incident.dependency?.toLowerCase().includes(normalizedSearch) ||
        incident.call_type_label?.toLowerCase().includes(normalizedSearch) ||
        incident.id.toLowerCase().includes(normalizedSearch)
    )
  }, [incidents, search])

  const moveToStatus = async (incident: BoardIncident, nextStatus: IncidentStatus) => {
    const { error } = await supabase
      .from("incidents")
      .update({
        status: nextStatus,
        resolved_at: null,
        is_public: false,
        resolution_summary: null,
      })
      .eq("id", incident.id)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIncidents((previous) =>
      previous.map((item) =>
        item.id === incident.id ? { ...item, status: nextStatus } : item
      )
    )
  }

  const handleMoveForward = (incident: BoardIncident) => {
    if (incident.status === "Pendiente") {
      void moveToStatus(incident, "En Progreso")
      return
    }

    if (incident.status === "En Progreso") {
      setResolvingIncident(incident)
    }
  }

  const handleResolveSubmit = async (payload: {
    isPublic: boolean
    resolutionSummary: string | null
  }) => {
    if (!resolvingIncident) {
      return
    }

    setIsResolving(true)
    const { error } = await supabase
      .from("incidents")
      .update({
        status: "Resuelto",
        resolved_at: new Date().toISOString(),
        is_public: payload.isPublic,
        resolution_summary: payload.resolutionSummary,
      })
      .eq("id", resolvingIncident.id)

    setIsResolving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setIncidents((previous) =>
      previous.map((item) =>
        item.id === resolvingIncident.id ? { ...item, status: "Resuelto" } : item
      )
    )
    setResolvingIncident(null)
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#f7f9fc] dark:bg-[#0d0b45]">
      <div className="flex shrink-0 items-center gap-4 border-b border-gray-100 bg-white px-6 py-4 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
            Tablero de Incidencias
          </h1>
          <p className="mt-0.5 text-xs text-gray-400">Vista Kanban</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
            <input
              type="search"
              placeholder="Buscar incidencia..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56 rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-950 dark:text-gray-100"
            />
          </div>
          <Button type="button" variant="outline" className="rounded-lg border-gray-200">
            <Filter className="size-4" />
            Filtrar
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <Button type="button" variant="outline" size="icon" className="rounded-lg">
            <Grid2X2 className="size-4" />
          </Button>
          <Button type="button" className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-600">
            <Plus className="size-4" />
            Nueva
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
        <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnIncidents = filtered.filter(
              (incident) => incident.status === column.status
            )

            return (
              <div key={column.status} className="flex min-w-0 flex-col">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${column.color}`} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">
                      {column.label}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {columnIncidents.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label={`Agregar incidencia a ${column.label}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className={`mb-3 h-1 rounded-full ${column.accent} opacity-80`} />

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
                  {columnIncidents.map((incident) => (
                    <TicketCard
                      key={incident.id}
                      incident={incident}
                      onMoveForward={handleMoveForward}
                    />
                  ))}

                  {columnIncidents.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-100 py-10 text-center text-xs text-gray-300">
                      Sin incidencias
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ResolveIncidentDialog
        isOpen={!!resolvingIncident}
        incidentTitle={resolvingIncident?.title ?? ""}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setResolvingIncident(null)
          }
        }}
        onSubmit={handleResolveSubmit}
        isSubmitting={isResolving}
      />
    </section>
  )
}
