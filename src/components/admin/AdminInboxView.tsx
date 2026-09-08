import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, MapPin, UserRound } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { LocationPreviewMap } from "@/components/citizen/LocationPreviewMap"
import { SubmitterProfileDialog } from "@/components/admin/SubmitterProfileDialog"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"
import { cn } from "@/lib/utils"

interface AdminInboxViewProps {
  searchQuery: string
  onlyPending: boolean
  highlightIncidentId?: string | null
}

interface InboxIncident {
  id: string
  title: string
  category: string
  dependency: string | null
  call_type_code: number | null
  call_type_label: string | null
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
export function AdminInboxView({
  searchQuery,
  onlyPending,
  highlightIncidentId = null,
}: AdminInboxViewProps) {
  const [items, setItems] = useState<InboxIncident[]>([])
  const [profileNames, setProfileNames] = useState<Record<string, string>>({})
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null)

  useEffect(() => {
    const loadInbox = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,title,category,dependency,call_type_code,call_type_label,status,created_at,user_id,latitude,longitude")
        .in("status", ["Pendiente", "En Progreso"])
        .order("created_at", { ascending: false })

      const nextItems = (data ?? []) as InboxIncident[]
      setItems(nextItems)

      const userIds = [
        ...new Set(
          nextItems
            .map((incident) => incident.user_id)
            .filter((userId): userId is string => Boolean(userId))
        ),
      ]

      if (userIds.length === 0) {
        setProfileNames({})
        return
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,first_name,last_name")
        .in("id", userIds)

      const nextNames: Record<string, string> = {}
      for (const profile of profiles ?? []) {
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ")
          .trim()
        nextNames[profile.id] = fullName || "Sin nombre"
      }
      setProfileNames(nextNames)
    }

    void loadInbox()
  }, [])

  useEffect(() => {
    if (!highlightIncidentId) {
      return
    }

    const highlightedCard = document.getElementById(`inbox-${highlightIncidentId}`)
    highlightedCard?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [highlightIncidentId, items])

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    return items.filter((incident) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        incident.id.toLowerCase().includes(normalizedQuery) ||
        incident.category.toLowerCase().includes(normalizedQuery) ||
        incident.dependency?.toLowerCase().includes(normalizedQuery) ||
        incident.call_type_label?.toLowerCase().includes(normalizedQuery) ||
        incident.title.toLowerCase().includes(normalizedQuery)

      const matchesPending = !onlyPending || incident.status === "Pendiente"

      return matchesSearch && matchesPending
    })
  }, [items, onlyPending, searchQuery])

  return (
    <section className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Bandeja de Entrada
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((incident) => (
          <article
            id={`inbox-${incident.id}`}
            key={incident.id}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-sm",
              highlightIncidentId === incident.id && "ring-2 ring-indigo-500"
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {incident.title}
                </p>
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

            <div className="space-y-0.5 text-sm text-muted-foreground">
              <p>{incident.category}</p>
              <p className="text-xs">{incident.dependency ?? "Sin dependencia"}</p>
              <p className="text-xs">
                {incident.call_type_code && incident.call_type_label
                  ? `${incident.call_type_code} - ${incident.call_type_label}`
                  : "Sin tipo de llamada"}
              </p>
            </div>
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
                Usuario:{" "}
                {incident.user_id
                  ? (profileNames[incident.user_id] ?? "Sin nombre")
                  : "Sin ID"}{" "}
                (ver perfil)
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
