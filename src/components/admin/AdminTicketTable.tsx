import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  ChevronDown,
  Filter,
  HelpCircle,
  MapPin,
  Search,
  UserRound,
} from "lucide-react"

import { SubmitterProfileDialog } from "@/components/admin/SubmitterProfileDialog"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface AdminIncident {
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
  user_id: string | null
  latitude: number | null
  longitude: number | null
}

type FilterTab = "Todos" | IncidentStatus

const FILTER_TABS: FilterTab[] = ["Todos", "Pendiente", "En Progreso", "Resuelto"]

const STATUS_LABELS: Record<IncidentStatus, string> = {
  Pendiente: "Recibido",
  "En Progreso": "En proceso",
  Resuelto: "Resuelto",
}

const STATUS_BADGE_STYLES: Record<IncidentStatus, string> = {
  Pendiente: "bg-blue-50 text-blue-600",
  "En Progreso": "bg-amber-50 text-amber-600",
  Resuelto: "bg-green-50 text-green-600",
}

const STATUS_DOT_STYLES: Record<IncidentStatus, string> = {
  Pendiente: "bg-blue-500",
  "En Progreso": "bg-amber-500",
  Resuelto: "bg-green-500",
}

function getPriority(incident: AdminIncident) {
  if (incident.status === "Pendiente") {
    return { label: "Alta", className: "bg-orange-50 text-orange-600" }
  }

  if (incident.status === "En Progreso") {
    return { label: "Media", className: "bg-amber-50 text-amber-600" }
  }

  return { label: "Baja", className: "bg-emerald-50 text-emerald-600" }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Incident management table for municipality staff.
 *
 * Displays live Supabase incident records using the desktop list from the
 * reference mockup. This view is intentionally read/detail oriented: status
 * transitions are handled from the Kanban board to keep the workflow explicit.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Incident management table with status visualization.
 */
export function AdminTicketTable() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<FilterTab>("Todos")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailIncident, setDetailIncident] = useState<AdminIncident | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [viewingLocation, setViewingLocation] = useState<AdminIncident | null>(null)

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const loadIncidents = async () => {
        const { data, error } = await supabase
          .from("incidents")
          .select(
            "id,title,description,category,dependency,call_type_code,call_type_label,status,created_at,image_url,user_id,latitude,longitude"
          )
          .order("created_at", { ascending: false })

        if (error) {
          setErrorMessage(error.message)
          setIsLoading(false)
          return
        }

        setIncidents((data ?? []) as AdminIncident[])
        setErrorMessage(null)
        setIsLoading(false)
      }

      void loadIncidents()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  const counts = useMemo(() => {
    return FILTER_TABS.reduce<Record<FilterTab, number>>(
      (accumulator, tab) => {
        accumulator[tab] =
          tab === "Todos"
            ? incidents.length
            : incidents.filter((incident) => incident.status === tab).length
        return accumulator
      },
      { Todos: 0, Pendiente: 0, "En Progreso": 0, Resuelto: 0 }
    )
  }, [incidents])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return incidents.filter((incident) => {
      const matchesTab = activeTab === "Todos" || incident.status === activeTab
      const matchesSearch =
        normalizedSearch.length === 0 ||
        incident.id.toLowerCase().includes(normalizedSearch) ||
        incident.title.toLowerCase().includes(normalizedSearch) ||
        incident.category.toLowerCase().includes(normalizedSearch) ||
        incident.dependency?.toLowerCase().includes(normalizedSearch) ||
        incident.call_type_label?.toLowerCase().includes(normalizedSearch)

      return matchesTab && matchesSearch
    })
  }, [activeTab, incidents, search])

  const allSelected =
    filtered.length > 0 && filtered.every((incident) => selectedIds.has(incident.id))

  const toggleSelect = (incidentId: string) => {
    setSelectedIds((previous) => {
      const next = new Set(previous)
      if (next.has(incidentId)) {
        next.delete(incidentId)
      } else {
        next.add(incidentId)
      }
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(filtered.map((incident) => incident.id)))
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#f7f9fc] dark:bg-[#0d0b45]">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">
            Incidencias
          </h1>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
            {incidents.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-gray-300" />
          <Button className="rounded-lg bg-[#5e5adb] text-white hover:bg-indigo-600">
            Nueva incidencia
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-6 py-3 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
        <Button
          type="button"
          variant="outline"
          className="rounded-lg border-gray-200 text-gray-600"
        >
          <Filter className="size-4" />
          Filtrar
          <ChevronDown className="size-3" />
        </Button>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-300" />
          <input
            type="search"
            placeholder="Buscar incidencia..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-950 dark:text-gray-100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-gray-300">
            /
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center overflow-x-auto border-b border-gray-100 bg-white px-6 dark:border-[#2a278f] dark:bg-[#1e1b7a]">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-[#5e5adb] text-[#5e5adb]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "Todos" ? "Todos" : STATUS_LABELS[tab]}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                activeTab === tab ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm dark:border-[#2a278f] dark:bg-[#1e1b7a]">
          <table className="w-full min-w-[1120px] table-fixed text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-indigo-900 dark:bg-indigo-950/40">
                <th className="w-10 px-2 py-3 sm:px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 rounded accent-indigo-500"
                    aria-label="Seleccionar todas las incidencias visibles"
                  />
                </th>
                <th className="w-12 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  #
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Incidencia
                </th>
                <th className="w-32 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Categoría
                </th>
                <th className="w-40 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Dependencia
                </th>
                <th className="w-52 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Tipo de llamada
                </th>
                <th className="w-32 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Estado
                </th>
                <th className="w-36 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Actualizado
                </th>
                <th className="w-28 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-3">
                  Prioridad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-indigo-900">
              {filtered.map((incident, index) => {
                const isSelected = selectedIds.has(incident.id)
                const priority = getPriority(incident)

                return (
                  <tr
                    key={incident.id}
                    className={`group cursor-pointer transition-colors hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 ${
                      isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/40" : ""
                    }`}
                    onClick={() => setDetailIncident(incident)}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleSelect(incident.id)
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(incident.id)}
                        className="size-4 rounded accent-indigo-500"
                        aria-label={`Seleccionar incidencia ${incident.title}`}
                      />
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span className="font-mono text-xs text-gray-500">{index + 1}</span>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <div className="break-words text-sm font-medium text-[#5e5adb] group-hover:underline">
                        {incident.title}
                      </div>
                      <div className="mt-0.5 break-all text-xs text-gray-400">
                        {incident.id}
                      </div>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span className="inline-flex max-w-full rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {incident.category}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span className="line-clamp-2 text-xs text-gray-600 dark:text-indigo-200">
                        {incident.dependency ?? "Sin dependencia"}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span className="line-clamp-2 text-xs text-gray-600 dark:text-indigo-200">
                        {incident.call_type_code && incident.call_type_label
                          ? `${incident.call_type_code} - ${incident.call_type_label}`
                          : "Sin tipo"}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_BADGE_STYLES[incident.status]
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${STATUS_DOT_STYLES[incident.status]}`}
                        />
                        {STATUS_LABELS[incident.status]}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
                        <CalendarDays className="size-3.5 shrink-0" />
                        <span>{formatDate(incident.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 sm:px-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}
                      >
                        {priority.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Search className="mx-auto mb-3 size-10 opacity-30" />
              <p className="text-sm">No se encontraron incidencias</p>
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center text-sm text-gray-400">
              Cargando incidencias...
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            {filtered.length} de {incidents.length} incidencias
          </span>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled className="rounded-lg">
              Anterior
            </Button>
            <Button size="sm" className="rounded-lg bg-indigo-500 text-white">
              1
            </Button>
            <Button size="sm" variant="outline" disabled className="rounded-lg">
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <SubmitterProfileDialog
        profileId={selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
      />

      <Dialog
        open={detailIncident !== null}
        onOpenChange={(open) => !open && setDetailIncident(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailIncident?.title}</DialogTitle>
            <DialogDescription>
              Detalle administrativo de la incidencia seleccionada.
            </DialogDescription>
          </DialogHeader>
          {detailIncident && (
            <div className="space-y-4">
              {detailIncident.image_url && (
                <img
                  src={detailIncident.image_url}
                  alt={`Evidencia de ${detailIncident.title}`}
                  className="h-56 w-full rounded-xl object-cover"
                />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Categoría</p>
                  <p className="text-sm text-gray-700">{detailIncident.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Dependencia</p>
                  <p className="text-sm text-gray-700">
                    {detailIncident.dependency ?? "Sin dependencia"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Tipo de llamada
                  </p>
                  <p className="text-sm text-gray-700">
                    {detailIncident.call_type_code && detailIncident.call_type_label
                      ? `${detailIncident.call_type_code} - ${detailIncident.call_type_label}`
                      : "Sin tipo"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-400">Estado</p>
                  <Badge className={STATUS_BADGE_STYLES[detailIncident.status]}>
                    {STATUS_LABELS[detailIncident.status]}
                  </Badge>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Descripción
                  </p>
                  <p className="text-sm text-gray-700">{detailIncident.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProfileId(detailIncident.user_id)}
                >
                  <UserRound className="size-4" />
                  Ver perfil ciudadano
                </Button>
                {detailIncident.latitude !== null && detailIncident.longitude !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setViewingLocation(detailIncident)}
                  >
                    <MapPin className="size-4" />
                    Ver ubicación
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewingLocation !== null}
        onOpenChange={(open) => !open && setViewingLocation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubicación de la incidencia</DialogTitle>
          </DialogHeader>
          {viewingLocation?.latitude !== null &&
            viewingLocation?.latitude !== undefined &&
            viewingLocation?.longitude !== null &&
            viewingLocation?.longitude !== undefined && (
              <LocationPreviewMap
                latitude={viewingLocation.latitude}
                longitude={viewingLocation.longitude}
              />
            )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
