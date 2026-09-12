import { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, UsersRound } from "lucide-react"

import { toUserFacingError } from "@/lib/network-errors"
import { supabase } from "@/lib/supabaseClient"

interface CommunityBoardProps {
  onBack?: () => void
}

interface PublicResolvedIncident {
  category: string
  resolution_summary: string | null
  resolution_image_url: string | null
  resolved_at: string | null
  published_at: string | null
}

/**
 * Public-facing board for anonymized, resolved incidents.
 *
 * Data sanitization is enforced at query time by selecting only
 * `category`, public classification metadata, `resolution_summary`,
 * `resolution_image_url`, and `resolved_at`.
 * No user identifiers, private descriptions, or location-level metadata are
 * requested or rendered in this component.
 *
 * @component
 * @module Citizen
 * @returns {JSX.Element} Sanitized community feed of published resolutions.
 */
export function CommunityBoard({ onBack }: CommunityBoardProps) {
  const [items, setItems] = useState<PublicResolvedIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadPublicResolvedIncidents = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .rpc("get_community_board")

      if (error) {
        setErrorMessage(toUserFacingError(error))
        setIsLoading(false)
        return
      }

      setItems(data ?? [])
      setIsLoading(false)
    }

    void loadPublicResolvedIncidents()
  }, [])

  return (
    <section className="px-4 py-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-indigo-300 hover:text-gray-100"
      >
        <ArrowLeft className="size-4" />
        Volver
      </button>

      <header className="mb-5">
        <h1 className="font-display text-xl font-bold text-gray-100">
          Muro Comunitario
        </h1>
        <p className="mt-1 text-xs text-indigo-300">
          Resoluciones publicadas por la alcaldía para tu comunidad.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-indigo-300">
          Cargando incidencias publicadas...
        </p>
      )}

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      {!isLoading && !errorMessage && items.length === 0 && (
        <div className="py-16 text-center text-indigo-300">
          <UsersRound className="mx-auto mb-3 size-12 opacity-50" />
          <p className="text-sm">Sin publicaciones en el muro</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <article
            key={`${item.category}-${item.published_at ?? item.resolved_at ?? "sin-fecha"}-${index}`}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
          >
            {item.resolution_image_url ? (
              <img
                src={item.resolution_image_url}
                alt={`Resolución publicada de ${item.category}`}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <CheckCircle2 className="size-9 text-emerald-500" />
              </div>
            )}

            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="size-3" />
                  Resuelto
                </span>
                <span className="text-xs text-gray-400">{item.category}</span>
              </div>
              <h2 className="mb-1 text-sm font-bold text-gray-900">
                Resolución publicada
              </h2>
              <p className="mb-3 text-xs leading-relaxed text-gray-500">
                {item.resolution_summary ??
                  "Resolución aplicada por el equipo técnico."}
              </p>
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs text-gray-400">
                <span>Publicado por la alcaldía</span>
                <span>
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString()
                    : "Fecha no disponible"}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
