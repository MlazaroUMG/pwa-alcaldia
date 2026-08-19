import type { ColumnDef } from "@tanstack/react-table"
import { MapPin, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IncidentStatus } from "@/lib/supabase.types"

export interface AdminIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
  image_url: string | null
  user_id: string | null
  latitude: number | null
  longitude: number | null
}

export const STATUS_BADGE_STYLES: Record<IncidentStatus, string> = {
  Pendiente:
    "border-red-200 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  "En Progreso":
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  Resuelto:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
}

interface TicketColumnsOptions {
  selectedStatuses: Record<string, IncidentStatus>
  onStatusSelect: (incidentId: string, status: IncidentStatus) => void
  onApplyStatus: (incidentId: string) => void
  onViewProfile: (userId: string | null) => void
  onViewLocation: (incident: AdminIncident) => void
}

/**
 * Column definitions for the incident management data table.
 *
 * Kept separate from {@link AdminTicketTable} so the table shell stays
 * generic and reusable; all state and side effects (status changes, profile
 * lookup, location preview) remain owned by the calling component and are
 * only invoked here through the provided callbacks.
 *
 * @param {TicketColumnsOptions} options Row action handlers and current UI state.
 * @returns {ColumnDef<AdminIncident>[]} Column definitions for TanStack Table.
 */
export function getTicketColumns({
  selectedStatuses,
  onStatusSelect,
  onApplyStatus,
  onViewProfile,
  onViewLocation,
}: TicketColumnsOptions): ColumnDef<AdminIncident>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-medium" title={row.original.id}>
          {row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-xs whitespace-normal">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant="outline" className={STATUS_BADGE_STYLES[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
      id: "submitter",
      header: "Ciudadano",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-primary"
          onClick={() => onViewProfile(row.original.user_id)}
        >
          <UserRound className="size-3.5" />
          Ver perfil
        </Button>
      ),
    },
    {
      id: "location",
      header: "Ubicación",
      enableGlobalFilter: false,
      cell: ({ row }) =>
        row.original.latitude !== null && row.original.longitude !== null ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-primary"
            onClick={() => onViewLocation(row.original)}
          >
            <MapPin className="size-3.5" />
            Ver mapa
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Sin registrar</span>
        ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acción</div>,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const incident = row.original
        return (
          <div className="flex justify-end gap-2">
            <Select
              value={selectedStatuses[incident.id]}
              onValueChange={(value) => onStatusSelect(incident.id, value as IncidentStatus)}
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
            <Button variant="outline" onClick={() => onApplyStatus(incident.id)}>
              Guardar
            </Button>
          </div>
        )
      },
    },
  ]
}
