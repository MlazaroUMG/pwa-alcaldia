import { useEffect, useMemo, useState } from "react"

import { ResolveIncidentDialog } from "@/components/admin/ResolveIncidentDialog"
import { SubmitterProfileDialog } from "@/components/admin/SubmitterProfileDialog"
import {
  getTicketColumns,
  type AdminIncident,
} from "@/components/admin/ticket-columns"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

/**
 * Incident management table for municipality staff.
 *
 * Displays live Supabase incident records with search, pagination, color-coded
 * status badges, citizen profile lookup, location preview, and admin actions
 * to progress or close tickets. Status-change and resolution logic is
 * unchanged from the original prototype table; only the rendering shell was
 * migrated to a reusable, searchable/paginated data table.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Incident management table with status visualization.
 */
export function AdminTicketTable() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, IncidentStatus>
  >({})
  const [resolvingIncident, setResolvingIncident] = useState<AdminIncident | null>(
    null
  )
  const [isResolving, setIsResolving] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [viewingLocation, setViewingLocation] = useState<AdminIncident | null>(null)

  const incidentById = useMemo(() => {
    return incidents.reduce<Record<string, AdminIncident>>((accumulator, incident) => {
      accumulator[incident.id] = incident
      return accumulator
    }, {})
  }, [incidents])

  const loadIncidents = async () => {
    const { data, error } = await supabase
      .from("incidents")
      .select("id,title,category,status,created_at,image_url,user_id,latitude,longitude")
      .order("created_at", { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
      return
    }

    const records = (data ?? []) as AdminIncident[]
    setIncidents(records)
    setSelectedStatuses(
      records.reduce<Record<string, IncidentStatus>>((accumulator, incident) => {
        accumulator[incident.id] = incident.status
        return accumulator
      }, {})
    )
    setErrorMessage(null)
    setIsLoading(false)
  }

  useEffect(() => {
    const bootstrapTimer = window.setTimeout(() => {
      void loadIncidents()
    }, 0)

    return () => window.clearTimeout(bootstrapTimer)
  }, [])

  const updateStatus = async (params: {
    incidentId: string
    status: IncidentStatus
    isPublic?: boolean
    resolutionSummary?: string | null
  }) => {
    const payload =
      params.status === "Resuelto"
        ? {
            status: params.status,
            resolved_at: new Date().toISOString(),
            is_public: params.isPublic ?? false,
            resolution_summary: params.resolutionSummary ?? null,
          }
        : {
            status: params.status,
            resolved_at: null,
            is_public: false,
            resolution_summary: null,
          }

    const { error } = await supabase.from("incidents").update(payload).eq("id", params.incidentId)

    if (error) {
      setErrorMessage(error.message)
      return false
    }

    setIncidents((previous) =>
      previous.map((incident) =>
        incident.id === params.incidentId
          ? { ...incident, status: params.status }
          : incident
      )
    )
    setSelectedStatuses((previous) => ({
      ...previous,
      [params.incidentId]: params.status,
    }))
    return true
  }

  const handleApplyStatus = async (incidentId: string) => {
    const selectedStatus = selectedStatuses[incidentId]

    if (!selectedStatus) {
      return
    }

    if (selectedStatus === "Resuelto") {
      const incident = incidentById[incidentId]
      if (incident) {
        setResolvingIncident(incident)
      }
      return
    }

    await updateStatus({
      incidentId,
      status: selectedStatus,
    })
  }

  const handleResolveSubmit = async (payload: {
    isPublic: boolean
    resolutionSummary: string | null
  }) => {
    if (!resolvingIncident) {
      return
    }

    setIsResolving(true)
    const didSucceed = await updateStatus({
      incidentId: resolvingIncident.id,
      status: "Resuelto",
      isPublic: payload.isPublic,
      resolutionSummary: payload.resolutionSummary,
    })
    setIsResolving(false)

    if (didSucceed) {
      setResolvingIncident(null)
    }
  }

  const columns = useMemo(
    () =>
      getTicketColumns({
        selectedStatuses,
        onStatusSelect: (incidentId, status) =>
          setSelectedStatuses((previous) => ({ ...previous, [incidentId]: status })),
        onApplyStatus: (incidentId) => void handleApplyStatus(incidentId),
        onViewProfile: (userId) => setSelectedProfileId(userId),
        onViewLocation: (incident) => setViewingLocation(incident),
      }),
    // Handlers close over state that changes each render (selectedStatuses,
    // incidentById); recomputing columns keeps the Select values in sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedStatuses, incidents]
  )

  return (
    <section className="w-full min-w-0 space-y-4 p-4 sm:p-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Gestión de incidencias
        </h2>
        <p className="text-sm text-muted-foreground">
          Prioriza, actualiza y resuelve los reportes ciudadanos activos.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={incidents}
        isLoading={isLoading}
        errorMessage={errorMessage}
        searchPlaceholder="Buscar por ID, título o categoría..."
        emptyMessage="No hay incidencias para mostrar."
      />

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

      <SubmitterProfileDialog
        profileId={selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
      />

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
