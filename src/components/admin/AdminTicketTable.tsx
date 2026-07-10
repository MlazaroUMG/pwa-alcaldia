import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type IncidentStatus = "Pendiente" | "En Progreso" | "Resuelto"

interface AdminIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
}

const MOCK_INCIDENTS: AdminIncident[] = [
  {
    id: "INC-2026-001",
    title: "Fuga de agua en colonia Alameda",
    category: "Agua",
    status: "Pendiente",
    created_at: "2026-07-09 08:15",
  },
  {
    id: "INC-2026-002",
    title: "Luminaria dañada en Avenida Central",
    category: "Iluminación",
    status: "En Progreso",
    created_at: "2026-07-09 10:42",
  },
  {
    id: "INC-2026-003",
    title: "Bache profundo frente al mercado zonal",
    category: "Infraestructura",
    status: "Resuelto",
    created_at: "2026-07-08 16:05",
  },
]

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
 * Displays a typed mock dataset with key metadata and color-coded status badges
 * to communicate operational urgency within the Admin Dashboard module.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Incident management table with status visualization.
 */
export function AdminTicketTable() {
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
            Total de incidencias simuladas: {MOCK_INCIDENTS.length}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_INCIDENTS.map((incident) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
