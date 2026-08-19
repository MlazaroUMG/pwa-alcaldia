import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface MyCasesViewProps {
  userId: string
}

interface MyIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
  latitude: number | null
  longitude: number | null
}

const STATUS_STYLES: Record<IncidentStatus, string> = {
  Pendiente:
    "border-muni-red/40 bg-muni-red/20 text-red-700 dark:text-red-300",
  "En Progreso":
    "border-muni-lightblue/50 bg-muni-lightblue/30 text-sky-800 dark:text-sky-200",
  Resuelto:
    "border-muni-green/40 bg-muni-green/30 text-emerald-800 dark:text-emerald-200",
}

/**
 * Citizen view for personal ticket tracking.
 *
 * Lists only incidents created by the authenticated citizen so they can follow
 * progress updates from submission to resolution.
 *
 * @component
 * @module Citizen
 * @returns {JSX.Element} Mobile-ready case timeline cards.
 */
export function MyCasesView({ userId }: MyCasesViewProps) {
  const [cases, setCases] = useState<MyIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null)

  useEffect(() => {
    const loadCases = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,title,category,status,created_at,latitude,longitude")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setCases((data ?? []) as MyIncident[])
      setIsLoading(false)
    }

    void loadCases()
  }, [userId])

  return (
    <section className="space-y-4 rounded-2xl bg-card p-4 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold text-foreground">Mis casos</h2>
        <p className="text-sm text-muted-foreground">
          Seguimiento de tus reportes ciudadanos.
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando casos...</p>}
      {!isLoading && cases.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aún no has creado reportes en el sistema.
        </p>
      )}

      <div className="space-y-3">
        {cases.map((incident) => (
          <article key={incident.id} className="rounded-xl border bg-background p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{incident.title}</p>
              <Badge variant="outline" className={STATUS_STYLES[incident.status]}>
                {incident.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{incident.category}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(incident.created_at).toLocaleString()}
            </p>

            {incident.latitude !== null && incident.longitude !== null && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-primary"
                  onClick={() =>
                    setExpandedCaseId((previous) =>
                      previous === incident.id ? null : incident.id
                    )
                  }
                >
                  <MapPin className="size-3.5" />
                  {expandedCaseId === incident.id
                    ? "Ocultar ubicación"
                    : "Ver ubicación"}
                </Button>

                {expandedCaseId === incident.id && (
                  <LocationPreviewMap
                    latitude={incident.latitude}
                    longitude={incident.longitude}
                    className="mt-2"
                  />
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
