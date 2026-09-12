import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DuplicateSuggestion } from "@/lib/duplicate-suggestions"

interface DuplicateIncidentDialogProps {
  suggestions: DuplicateSuggestion[]
  onCancel: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

/**
 * Solicita confirmación humana cuando la IA de apoyo encuentra coincidencias.
 *
 * @component
 * @module Citizen
 */
export function DuplicateIncidentDialog({
  suggestions,
  onCancel,
  onConfirm,
  isSubmitting,
}: DuplicateIncidentDialogProps) {
  return (
    <Dialog open={suggestions.length > 0} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Posible reporte duplicado
          </DialogTitle>
          <DialogDescription>
            Se encontraron incidencias abiertas cercanas. La sugerencia puede
            equivocarse; tú decides si deseas continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <article
              key={`${suggestion.created_at}-${index}`}
              className="rounded-xl border bg-muted/40 p-3 text-sm"
            >
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {suggestion.category}
              </p>
              <p className="text-xs text-muted-foreground">
                {suggestion.call_type_code && suggestion.call_type_label
                  ? `${suggestion.call_type_code} - ${suggestion.call_type_label}`
                  : "Sin tipo de llamada"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                A unos {suggestion.approximate_distance_m} m ·{" "}
                {new Date(suggestion.created_at).toLocaleDateString("es-GT")}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-indigo-500 text-white hover:bg-indigo-600"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Enviando..." : "Enviar de todos modos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
