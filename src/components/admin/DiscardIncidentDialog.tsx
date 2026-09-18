import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CharacterCount } from "@/components/ui/character-count"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FIELD_LIMITS, discardNoteSchema, discardReasonSchema } from "@/lib/validation"

interface DiscardIncidentDialogProps {
  open: boolean
  count: number
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, note: string) => Promise<void>
  isSubmitting?: boolean
}

const DISCARD_REASONS = [
  "Reporte duplicado",
  "Fuera de competencia municipal",
  "Información insuficiente o no verificable",
  "Contenido improcedente",
  "Otro motivo operativo",
]

/**
 * Confirma el descarte reversible de una o varias incidencias.
 *
 * @component
 * @module Admin
 */
export function DiscardIncidentDialog({
  open,
  count,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
}: DiscardIncidentDialogProps) {
  const [reason, setReason] = useState(DISCARD_REASONS[0])
  const [note, setNote] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    const parsedReason = discardReasonSchema.safeParse(reason)
    if (!parsedReason.success) {
      setErrorMessage(parsedReason.error.issues[0]?.message ?? "Indica un motivo.")
      return
    }

    const parsedNote = discardNoteSchema.safeParse(note)
    if (!parsedNote.success) {
      setErrorMessage(parsedNote.error.issues[0]?.message ?? "La nota es demasiado larga.")
      return
    }

    setErrorMessage(null)
    await onConfirm(parsedReason.data, parsedNote.data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Descartar incidencias</DialogTitle>
          <DialogDescription>
            Se ocultarán {count} reporte{count === 1 ? "" : "s"} de los flujos
            normales. El registro y las fotografías se conservan.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block text-sm font-medium">Motivo</label>
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {DISCARD_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="space-y-1">
            <Textarea
              value={note}
              maxLength={FIELD_LIMITS.discardNote.max}
              rows={4}
              className="max-h-32 min-h-24"
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nota interna opcional"
            />
            <CharacterCount value={note} max={FIELD_LIMITS.discardNote.max} />
          </div>
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={isSubmitting} onClick={() => void handleConfirm()}>
              {isSubmitting ? "Descartando..." : "Descartar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
