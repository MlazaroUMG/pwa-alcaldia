import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface ResolveIncidentDialogProps {
  isOpen: boolean
  incidentTitle: string
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (payload: {
    isPublic: boolean
    resolutionSummary: string | null
  }) => Promise<void>
  isSubmitting: boolean
}

/**
 * Resolution curation dialog shown when admins close incidents.
 *
 * This workflow explicitly controls which fields can reach the public feed:
 * only `is_public` and `resolution_summary` are captured here, while sensitive
 * incident data stays out of the Community Board projection.
 *
 * @component
 * @module Admin
 * @returns {JSX.Element} Modal used to publish anonymized resolution content.
 */
export function ResolveIncidentDialog({
  isOpen,
  incidentTitle,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: ResolveIncidentDialogProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [resolutionSummary, setResolutionSummary] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({
      isPublic,
      resolutionSummary: isPublic ? resolutionSummary.trim() || null : null,
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsPublic(false)
      setResolutionSummary("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar en Community Board?</DialogTitle>
          <DialogDescription>
            Incidencia: <span className="font-medium text-foreground">{incidentTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="public-toggle">Hacer visible para la comunidad</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <div className="space-y-2">
              <Label htmlFor="resolution-summary">Resumen de resolución</Label>
              <Textarea
                id="resolution-summary"
                placeholder="Ej. Bache reparado en la 4ta calle."
                value={resolutionSummary}
                onChange={(event) => setResolutionSummary(event.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar resolución"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
