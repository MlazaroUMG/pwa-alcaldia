import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabaseClient"

interface PublicResolvedIncident {
  category: string
  resolution_summary: string | null
  image_url: string | null
  resolved_at: string | null
}

/**
 * Public-facing board for anonymized, resolved incidents.
 *
 * Data sanitization is enforced at query time by selecting only
 * `category`, `resolution_summary`, `image_url`, and `resolved_at`.
 * No user identifiers, private descriptions, or location-level metadata are
 * requested or rendered in this component.
 *
 * @component
 * @module Citizen
 * @returns {JSX.Element} Sanitized community feed of published resolutions.
 */
export function CommunityBoard() {
  const [items, setItems] = useState<PublicResolvedIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPublicResolvedIncidents = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from("incidents")
        .select("category,resolution_summary,image_url,resolved_at")
        .eq("is_public", true)
        .eq("status", "Resuelto")
        .order("resolved_at", { ascending: false })

      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
        return
      }

      setItems(data ?? [])
      setIsLoading(false)
    }

    void loadPublicResolvedIncidents()
  }, [])

  return (
    <section className="space-y-4 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Community Board
        </h2>
        <p className="text-sm text-muted-foreground">
          Historial público de incidencias resueltas por la municipalidad.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Cargando incidencias publicadas...
        </p>
      )}

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      {!isLoading && !errorMessage && items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay incidencias públicas resueltas por el momento.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <article
            key={`${item.category}-${item.resolved_at ?? "sin-fecha"}-${index}`}
            className="space-y-3 rounded-lg border p-4"
          >
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Categoría
              </p>
              <p className="font-medium text-foreground">{item.category}</p>
            </div>

            {item.image_url && (
              <img
                src={item.image_url}
                alt={`Evidencia de incidencia en ${item.category}`}
                className="h-44 w-full rounded-md object-cover"
                loading="lazy"
              />
            )}

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resolución
              </p>
              <p className="text-sm text-foreground">
                {item.resolution_summary ?? "Resolución aplicada por el equipo técnico."}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Fecha:{" "}
              {item.resolved_at
                ? new Date(item.resolved_at).toLocaleDateString()
                : "No disponible"}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
