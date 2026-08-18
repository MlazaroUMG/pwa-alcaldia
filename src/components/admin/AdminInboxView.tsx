import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, MapPin, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import { SubmitterProfileDialog } from "@/components/admin/SubmitterProfileDialog"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface AdminInboxViewProps {
  searchQuery: string
  onlyPending: boolean
}

interface InboxIncident {
  id: string
  title: string
  category: string
  status: IncidentStatus
  created_at: string
  user_id: string | null
  latitude: number | null
  longitude: number | null
}

/**
 * Admin inbox of incoming or in-progress incidents.
 *
 * Prioritizes quick triage with visible submitter metadata, a profile modal
 * for identity verification, and an on-demand location preview before
 * actioning the ticket.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Card-based incident inbox with profile lookup.
 */
export function AdminInboxView({ searchQuery, onlyPending }: AdminInboxViewProps) {
  const [items, setItems] = useState<InboxIncident[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null)

  useEffect(() => {
    const loadInbox = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,title,category,status,created_at,user_id,latitude,longitude")
        .in("status", ["Pendiente", "En Progreso"])
        .order("created_at", { ascending: false })

      setItems((data ?? []) as InboxIncident[])
    }

    void loadInbox()
  }, [])

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return items.filter((incident) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        incident.id.toLowerCase().includes(normalizedQuery) ||
        incident.category.toLowerCase().includes(normalizedQuery) ||
        incident.title.toLowerCase().includes(normalizedQuery)

      const matchesPending = !onlyPending || incident.status === "Pendiente"

      return matchesSearch && matchesPending
    })
  }, [items, onlyPending, searchQuery])

  return (
    <section className="w-full space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-foreground">Bandeja de Entrada</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((incident) => (
          <article key={incident.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-foreground">{incident.title}</p>
                <p className="text-sm text-muted-foreground">{incident.id}</p>
              </div>
              {incident.status === "Pendiente" ? (
                <Badge className="bg-muni-red text-white">
                  <AlertTriangle className="size-3" />
                  Prioridad alta
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muni-lightblue text-sky-700">
                  En seguimiento
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{incident.category}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(incident.created_at).toLocaleString()}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setSelectedProfileId(incident.user_id)}
              >
                <UserRound className="size-4" />
                Usuario: {incident.user_id ? `USR-${incident.user_id.slice(0, 8)}` : "Sin ID"} (ver perfil)
              </button>

              {incident.latitude !== null && incident.longitude !== null && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() =>
                    setExpandedLocationId((previous) =>
                      previous === incident.id ? null : incident.id
                    )
                  }
                >
                  <MapPin className="size-4" />
                  {expandedLocationId === incident.id ? "Ocultar ubicación" : "Ver ubicación"}
                </button>
              )}
            </div>

            {expandedLocationId === incident.id &&
              incident.latitude !== null &&
              incident.longitude !== null && (
                <LocationPreviewMap
                  latitude={incident.latitude}
                  longitude={incident.longitude}
                  className="mt-3"
                />
              )}
          </article>
        ))}
      </div>

      <SubmitterProfileDialog
        profileId={selectedProfileId}
        onOpenChange={(open) => !open && setSelectedProfileId(null)}
      />
    </section>
  )
}
