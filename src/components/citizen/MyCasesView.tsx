import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import type { IncidentStatus } from "@/lib/supabase.types"

interface MyCasesViewProps {
  userId: string
  onBack?: () => void
}

interface MyIncident {
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
  resolution_image_url: string | null
  resolution_summary: string | null
  resolved_at: string | null
}

const STATUS_STYLES: Record<IncidentStatus, string> = {
  Pendiente: "bg-blue-50 text-blue-600",
  "En Progreso": "bg-amber-50 text-amber-600",
  Resuelto: "bg-green-50 text-green-600",
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  Pendiente: "Recibido",
  "En Progreso": "En proceso",
  Resuelto: "Resuelto",
}

function StatusTimeline({ status }: { status: IncidentStatus }) {
  const currentIndex = status === "Pendiente" ? 0 : status === "En Progreso" ? 1 : 3
  const steps = ["Recibido", "En proceso", "En revisión", "Resuelto"]

  return (
    <>
      <div className="mt-3 flex items-center">
        {steps.map((step, index) => {
          const done = index <= currentIndex
          return (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={`size-2.5 shrink-0 rounded-full transition-colors ${
                  done ? "bg-indigo-500" : "bg-gray-300"
                }`}
              />
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    index < currentIndex ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        {steps.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </>
  )
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
export function MyCasesView({ userId, onBack }: MyCasesViewProps) {
  const [cases, setCases] = useState<MyIncident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<MyIncident | null>(null)

  useEffect(() => {
    const loadCases = async () => {
      const { data } = await supabase
        .from("incidents")
        .select("id,title,description,category,dependency,call_type_code,call_type_label,status,created_at,image_url,resolution_image_url,resolution_summary,resolved_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      setCases((data ?? []) as MyIncident[])
      setIsLoading(false)
    }

    void loadCases()
  }, [userId])

  if (selectedCase) {
    return (
      <section className="px-4 py-5">
        <button
          type="button"
          onClick={() => setSelectedCase(null)}
          className="mb-4 flex items-center gap-1.5 text-sm text-indigo-300 hover:text-gray-100"
        >
          <ArrowLeft className="size-4" />
          Mis tickets
        </button>

        <article className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {selectedCase.image_url && (
            <img
              src={selectedCase.image_url}
              alt={`Evidencia de ${selectedCase.title}`}
              className="h-44 w-full object-cover"
            />
          )}
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-xs text-gray-400">
                {selectedCase.id.slice(0, 8)}
              </span>
              <Badge className={STATUS_STYLES[selectedCase.status]}>
                {STATUS_LABELS[selectedCase.status]}
              </Badge>
            </div>
            <h2 className="font-display mb-1 text-base font-bold text-gray-900">
              {selectedCase.title}
            </h2>
            <div className="mb-3 space-y-0.5 text-xs text-gray-500">
              <p>{selectedCase.category}</p>
              <p>{selectedCase.dependency ?? "Sin dependencia"}</p>
              <p>
                {selectedCase.call_type_code && selectedCase.call_type_label
                  ? `${selectedCase.call_type_code} - ${selectedCase.call_type_label}`
                  : "Sin tipo de llamada"}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {selectedCase.description}
            </p>
            <StatusTimeline status={selectedCase.status} />
          </div>
        </article>

        {selectedCase.status === "Resuelto" && (
          <article className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-green-800">Resolución</h3>
            {selectedCase.resolution_image_url && (
              <img
                src={selectedCase.resolution_image_url}
                alt={`Resolución de ${selectedCase.title}`}
                className="mb-3 h-36 w-full rounded-xl object-cover"
              />
            )}
            <p className="text-sm text-green-700">
              {selectedCase.resolution_summary ??
                "Incidencia resuelta por las autoridades correspondientes."}
            </p>
          </article>
        )}
      </section>
    )
  }

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

      <h1 className="font-display mb-5 text-xl font-bold text-gray-100">Mis Tickets</h1>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando casos...</p>}
      {!isLoading && cases.length === 0 && (
        <p className="text-sm text-indigo-300">
          Aún no has creado reportes en el sistema.
        </p>
      )}

      <div className="space-y-3">
        {cases.map((incident) => (
          <button
            key={incident.id}
            type="button"
            onClick={() => setSelectedCase(incident)}
            className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 font-mono text-xs text-gray-400">
                  {incident.id.slice(0, 8)}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {incident.title}
                </div>
              </div>
              <Badge className={STATUS_STYLES[incident.status]}>
                {STATUS_LABELS[incident.status]}
              </Badge>
            </div>
            <div className="mb-2 space-y-0.5 text-xs text-gray-400">
              <p>{incident.category}</p>
              <p>{incident.dependency ?? "Sin dependencia"}</p>
              <p>
                {incident.call_type_code && incident.call_type_label
                  ? `${incident.call_type_code} - ${incident.call_type_label}`
                  : "Sin tipo de llamada"}
              </p>
            </div>
            <StatusTimeline status={incident.status} />
          </button>
        ))}
      </div>
    </section>
  )
}
