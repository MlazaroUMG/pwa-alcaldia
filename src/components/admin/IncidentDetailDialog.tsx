import { Download, MapPin, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { IncidentStatus } from "@/lib/supabase.types"

export interface IncidentDetail {
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

interface IncidentDetailDialogProps {
  incident: IncidentDetail | null
  onOpenChange: (open: boolean) => void
  onViewProfile?: (userId: string | null) => void
  onViewLocation?: (incident: IncidentDetail) => void
  onDownloadImage?: (incident: IncidentDetail) => void
  onMoveForward?: (incident: IncidentDetail) => void
  onMoveBackward?: (incident: IncidentDetail) => void
  isAdvancing?: boolean
  isPossibleDuplicate?: boolean
  suggestedPriority?: "Alta" | "Media"
}

/**
 * Detalle administrativo compartido de una incidencia.
 *
 * La descarga de evidencia se habilita desde Incidencias; el avance de estado
 * solo se muestra en el Tablero Kanban.
 *
 * @component
 * @module Admin
 */
export function IncidentDetailDialog({
  incident,
  onOpenChange,
  onViewProfile,
  onViewLocation,
  onDownloadImage,
  onMoveForward,
  onMoveBackward,
  isAdvancing = false,
  isPossibleDuplicate = false,
  suggestedPriority,
}: IncidentDetailDialogProps) {
  const nextActionLabel =
    incident?.status === "Pendiente"
      ? "Mover a En proceso"
      : incident?.status === "En Progreso"
        ? "Resolver incidencia"
        : null
  const previousActionLabel =
    incident?.status === "En Progreso"
      ? "Volver a Recibido"
      : incident?.status === "Resuelto"
        ? "Volver a En proceso"
        : null

  return (
    <Dialog open={incident !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{incident?.title}</DialogTitle>
          <DialogDescription>
            Detalle administrativo de la incidencia seleccionada.
          </DialogDescription>
        </DialogHeader>
        {incident && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isPossibleDuplicate && (
                <Badge className="bg-purple-50 text-purple-700">
                  Posible duplicado
                </Badge>
              )}
              {suggestedPriority && (
                <Badge className="bg-amber-50 text-amber-700">
                  Prioridad sugerida: {suggestedPriority}
                </Badge>
              )}
            </div>
            {incident.image_url && (
              <img
                src={incident.image_url}
                alt={`Evidencia de ${incident.title}`}
                className="h-56 w-full rounded-xl object-cover"
              />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Categoría</p>
                <p className="text-sm text-gray-700">{incident.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Dependencia</p>
                <p className="text-sm text-gray-700">
                  {incident.dependency ?? "Sin dependencia"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Tipo de llamada
                </p>
                <p className="text-sm text-gray-700">
                  {incident.call_type_code && incident.call_type_label
                    ? `${incident.call_type_code} - ${incident.call_type_label}`
                    : "Sin tipo"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">Estado</p>
                <Badge className={STATUS_BADGE_STYLES[incident.status]}>
                  {STATUS_LABELS[incident.status]}
                </Badge>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Descripción
                </p>
                <p className="text-sm text-gray-700">{incident.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {onViewProfile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onViewProfile(incident.user_id)}
                >
                  <UserRound className="size-4" />
                  Ver perfil ciudadano
                </Button>
              )}
              {onViewLocation &&
                incident.latitude !== null &&
                incident.longitude !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onViewLocation(incident)}
                  >
                    <MapPin className="size-4" />
                    Ver ubicación
                  </Button>
                )}
              {onDownloadImage && incident.image_url && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onDownloadImage(incident)}
                >
                  <Download className="size-4" />
                  Descargar imagen
                </Button>
              )}
              {onMoveBackward && previousActionLabel && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isAdvancing}
                  onClick={() => onMoveBackward(incident)}
                >
                  {isAdvancing ? "Actualizando..." : previousActionLabel}
                </Button>
              )}
              {onMoveForward && nextActionLabel && (
                <Button
                  type="button"
                  className="bg-[#5e5adb] text-white hover:bg-indigo-600"
                  disabled={isAdvancing}
                  onClick={() => onMoveForward(incident)}
                >
                  {isAdvancing ? "Actualizando..." : nextActionLabel}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
