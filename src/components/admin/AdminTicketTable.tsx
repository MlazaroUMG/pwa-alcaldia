import { useEffect, useMemo, useState } from "react"

import { ResolveIncidentDialog } from "@/components/admin/ResolveIncidentDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface AdminIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
  image_url: string | null
}

const STATUS_BADGE_STYLES: Record<IncidentStatus, string> = {
  Pendiente:
    "border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  "En Progreso":
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  Resuelto:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
}

/**
 * Prototype table for municipality staff to quickly review incoming incidents.
 *
 * Displays live Supabase incident records with key metadata, color-coded status
 * badges, and admin actions to progress or close tickets.
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

  const totalCount = incidents.length

  const incidentById = useMemo(() => {
    return incidents.reduce<Record<string, AdminIncident>>((accumulator, incident) => {
      accumulator[incident.id] = incident
      return accumulator
    }, {})
  }, [incidents])

  const loadIncidents = async () => {
    const { data, error } = await supabase
      .from("incidents")
      .select("id,title,category,status,created_at,image_url")
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

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Bandeja de incidencias
        </h2>
        <p className="text-sm text-muted-foreground">
          Vista inicial para el equipo administrativo de la municipalidad.
        </p>
      </header>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableCaption>
            Total de incidencias registradas: {totalCount}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                  Cargando incidencias...
                </TableCell>
              </TableRow>
            )}

            {!isLoading && errorMessage && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-destructive">
                  {errorMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !errorMessage && incidents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                  No hay incidencias para mostrar.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              !errorMessage &&
              incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">{incident.id}</TableCell>
                <TableCell className="max-w-xs whitespace-normal">
                  {incident.title}
                </TableCell>
                <TableCell>{incident.category}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_STYLES[incident.status]}
                  >
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>{incident.created_at}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Select
                      value={selectedStatuses[incident.id]}
                      onValueChange={(value) =>
                        setSelectedStatuses((previous) => ({
                          ...previous,
                          [incident.id]: value as IncidentStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                        <SelectItem value="Resuelto">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => void handleApplyStatus(incident.id)}
                    >
                      Guardar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
