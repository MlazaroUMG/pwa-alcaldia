import { useEffect, useMemo, useRef, useState } from "react"
import {
  FileText,
  Search,
  UserRound,
} from "lucide-react"

import { IncidentDetailDialog, type IncidentDetail } from "@/components/admin/IncidentDetailDialog"
import {
  ResolveIncidentDialog,
  type ResolveIncidentPayload,
} from "@/components/admin/ResolveIncidentDialog"
import { SubmitterProfileDialog } from "@/components/admin/SubmitterProfileDialog"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  findPossibleDuplicateIds,
  getSuggestedPriority,
} from "@/lib/duplicate-suggestions"
import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

type BoardIncident = IncidentDetail

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
  if (getSuggestedPriority(incident.category, incident.created_at) === "Alta") {
    return { label: "Alta", className: "bg-orange-50 text-orange-600" }
  }

  return { label: "Media", className: "bg-amber-50 text-amber-600" }
}

interface TicketCardProps {
  incident: BoardIncident
  isPossibleDuplicate: boolean
  onSelect: (incident: BoardIncident) => void
  onMoveForward: (incident: BoardIncident) => void
  onMoveBackward: (incident: BoardIncident) => void
}

function TicketCard({
  incident,
  isPossibleDuplicate,
  onSelect,
  onMoveForward,
  onMoveBackward,
}: TicketCardProps) {
  const priority = getPriority(incident)
  const nextAction =
    incident.status === "Pendiente"
      ? "Mover a proceso"
      : incident.status === "En Progreso"
        ? "Resolver"
        : null
  const previousAction = incident.status === "Pendiente" ? null : "Volver"

  return (
    <article
      className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a278f] dark:bg-[#1e1b7a]"
      onClick={() => onSelect(incident)}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.className}`}>
          {priority.label}
        </span>
        <div className="flex items-center gap-1">
          {previousAction && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-lg px-2 text-xs text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation()
                onMoveBackward(incident)
              }}
            >
              {previousAction}
            </Button>
          )}
          {nextAction && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 rounded-lg px-2 text-xs text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
              onClick={(event) => {
                event.stopPropagation()
                onMoveForward(incident)
              }}
            >
              {nextAction}
            </Button>
          )}
        </div>
      </div>

      <h3 className="mb-1 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
        {incident.title}
      </h3>
      {isPossibleDuplicate && (
        <span className="mb-2 inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
          Posible duplicado
        </span>
      )}
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
 * Conserva el flujo persistido: se puede avanzar Recibido → En proceso → Resuelto
 * y retroceder Resuelto → En proceso → Recibido. Al salir de Resuelto se limpian
 * fecha, publicación y evidencia de resolución.
 *
 * @component
 * @module Admin
 */
export function AdminTicketsBoardView() {
  const [incidents, setIncidents] = useState<BoardIncident[]>([])
  const [search, setSearch] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [detailIncident, setDetailIncident] = useState<BoardIncident | null>(null)
  const [resolvingIncident, setResolvingIncident] = useState<BoardIncident | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [viewingLocation, setViewingLocation] = useState<BoardIncident | null>(null)
  const childDialogParentRef = useRef<BoardIncident | null>(null)

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      const loadBoard = async () => {
        const { data, error } = await supabase
          .from("incidents")
          .select(
            "id,title,description,category,dependency,call_type_code,call_type_label,status,created_at,image_url,user_id,latitude,longitude"
          )
          .order("created_at", { ascending: false })

        if (error) {
          setErrorMessage(toUserFacingError(error))
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
  const possibleDuplicateIds = useMemo(
    () => findPossibleDuplicateIds(incidents),
    [incidents]
  )

  const moveToStatus = async (incident: BoardIncident, nextStatus: IncidentStatus) => {
    const { error } = await supabase
      .from("incidents")
      .update({
        status: nextStatus,
        resolved_at: null,
        is_public: false,
        resolution_summary: null,
        resolution_image_url: null,
      })
      .eq("id", incident.id)

    if (error) {
      setErrorMessage(toUserFacingError(error))
      return
    }

    const updatedIncident = { ...incident, status: nextStatus }
    setIncidents((previous) =>
      previous.map((item) => (item.id === incident.id ? updatedIncident : item))
    )
    setDetailIncident((current) =>
      current?.id === incident.id ? updatedIncident : current
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

  const handleMoveBackward = (incident: BoardIncident) => {
    if (incident.status === "Resuelto") {
      void moveToStatus(incident, "En Progreso")
      return
    }

    if (incident.status === "En Progreso") {
      void moveToStatus(incident, "Pendiente")
    }
  }

  const closeChildDialog = (closeChild: () => void) => {
    const parentIncident = childDialogParentRef.current
    closeChild()

    // Radix puede solicitar el cierre del padre durante la restauración de foco
    // de la X. Se restaura el detalle al terminar el evento del diálogo hijo.
    window.requestAnimationFrame(() => {
      if (parentIncident) {
        setDetailIncident(parentIncident)
      }
      childDialogParentRef.current = null
    })
  }

  const handleResolveSubmit = async (payload: ResolveIncidentPayload) => {
    if (!resolvingIncident) {
      return
    }

    setIsResolving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsResolving(false)
      setErrorMessage("No se pudo verificar la sesión administrativa.")
      return
    }

    const fileExtension = payload.photo.name.split(".").pop() ?? "jpg"
    const filePath = `resolutions/${user.id}/${resolvingIncident.id}-${Date.now()}.${fileExtension}`

    const { error: uploadError } = await supabase.storage
      .from("incident-photos")
      .upload(filePath, payload.photo, {
        upsert: false,
      })

    if (uploadError) {
      setIsResolving(false)
      setErrorMessage(
        toUserFacingError(uploadError, "No se pudo subir la fotografía de resolución.")
      )
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from("incident-photos")
      .getPublicUrl(filePath)

    const { error } = await supabase
      .from("incidents")
      .update({
        status: "Resuelto",
        resolved_at: new Date().toISOString(),
        is_public: payload.isPublic,
        resolution_summary: payload.resolutionSummary,
        resolution_image_url: publicUrlData.publicUrl,
      })
      .eq("id", resolvingIncident.id)

    setIsResolving(false)

    if (error) {
      setErrorMessage(toUserFacingError(error))
      return
    }

    const resolvedIncident = { ...resolvingIncident, status: "Resuelto" as const }
    setIncidents((previous) =>
      previous.map((item) => (item.id === resolvingIncident.id ? resolvedIncident : item))
    )
    setDetailIncident((current) =>
      current?.id === resolvingIncident.id ? resolvedIncident : current
    )
    setResolvingIncident(null)
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f9fc] dark:bg-[#0d0b45]">
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
        </div>
      </div>

      {errorMessage && (
        <div className="mx-6 mt-4 shrink-0 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-5 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnIncidents = filtered.filter(
              (incident) => incident.status === column.status
            )

            return (
              <div key={column.status} className="flex min-h-0 min-w-0 flex-col">
                <div className="mb-3 flex shrink-0 items-center px-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${column.color}`} />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">
                      {column.label}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      {columnIncidents.length}
                    </span>
                  </div>
                </div>

                <div className={`mb-3 h-1 shrink-0 rounded-full ${column.accent} opacity-80`} />

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-color:rgba(148,163,184,0.45)_transparent] [scrollbar-width:thin]">
                  {columnIncidents.map((incident) => (
                    <TicketCard
                      key={incident.id}
                      incident={incident}
                      isPossibleDuplicate={possibleDuplicateIds.has(incident.id)}
                      onSelect={setDetailIncident}
                      onMoveForward={handleMoveForward}
                      onMoveBackward={handleMoveBackward}
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

      <IncidentDetailDialog
        incident={detailIncident}
        onOpenChange={(open) => {
          const hasResolutionDialog = resolvingIncident !== null
          if (
            !open &&
            childDialogParentRef.current === null &&
            !hasResolutionDialog
          ) {
            setDetailIncident(null)
          }
        }}
        isPossibleDuplicate={
          detailIncident ? possibleDuplicateIds.has(detailIncident.id) : false
        }
        suggestedPriority={
          detailIncident
            ? getSuggestedPriority(detailIncident.category, detailIncident.created_at)
            : undefined
        }
        onViewProfile={(userId) => {
          childDialogParentRef.current = detailIncident
          setSelectedProfileId(userId)
        }}
        onViewLocation={(incident) => {
          childDialogParentRef.current = detailIncident
          setViewingLocation(incident)
        }}
        onMoveForward={handleMoveForward}
        onMoveBackward={handleMoveBackward}
        isAdvancing={isResolving}
      />

      <SubmitterProfileDialog
        profileId={selectedProfileId}
        onOpenChange={(open) => {
          if (!open) {
            closeChildDialog(() => setSelectedProfileId(null))
          }
        }}
      />

      <Dialog
        open={viewingLocation !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeChildDialog(() => setViewingLocation(null))
          }
        }}
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
