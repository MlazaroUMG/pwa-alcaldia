import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  INCIDENT_CALL_TYPES_BY_DEPENDENCY,
  INCIDENT_DEPENDENCIES,
  getCallTypeLabel,
  type IncidentDependency,
} from "@/lib/incident-classification"

interface IncidentsFilterBarProps {
  dependency: IncidentDependency | "all"
  callTypeCode: number | "all"
  onDependencyChange: (value: IncidentDependency | "all") => void
  onCallTypeChange: (value: number | "all") => void
}

/**
 * Filtros estructurados de dependencia y tipo para la vista Incidencias.
 *
 * @component
 * @module Admin
 */
export function IncidentsFilterBar({
  dependency,
  callTypeCode,
  onDependencyChange,
  onCallTypeChange,
}: IncidentsFilterBarProps) {
  const callTypes =
    dependency === "all"
      ? Object.values(INCIDENT_CALL_TYPES_BY_DEPENDENCY).flat()
      : INCIDENT_CALL_TYPES_BY_DEPENDENCY[dependency]
  const hasFilters = dependency !== "all" || callTypeCode !== "all"

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="incidents-dependency-filter">
        Filtrar por dependencia
      </label>
      <select
        id="incidents-dependency-filter"
        value={dependency}
        onChange={(event) => {
          onDependencyChange(event.target.value as IncidentDependency | "all")
          onCallTypeChange("all")
        }}
        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-950 dark:text-gray-100"
      >
        <option value="all">Todas las dependencias</option>
        {INCIDENT_DEPENDENCIES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="incidents-call-type-filter">
        Filtrar por tipo de llamada
      </label>
      <select
        id="incidents-call-type-filter"
        value={callTypeCode}
        onChange={(event) =>
          onCallTypeChange(
            event.target.value === "all" ? "all" : Number(event.target.value)
          )
        }
        className="h-9 max-w-xs rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-950 dark:text-gray-100"
      >
        <option value="all">Todos los tipos de llamada</option>
        {callTypes.map((option) => (
          <option key={`${option.code}-${option.label}`} value={option.code}>
            {getCallTypeLabel(option)}
          </option>
        ))}
      </select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onDependencyChange("all")
            onCallTypeChange("all")
          }}
        >
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
