import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Camera, ImagePlus } from "lucide-react"

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

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024

export interface ResolveIncidentPayload {
  isPublic: boolean
  resolutionSummary: string
  photo: File
}

interface ResolveIncidentDialogProps {
  isOpen: boolean
  incidentTitle: string
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (payload: ResolveIncidentPayload) => Promise<void>
  isSubmitting: boolean
}

function ResolutionPhotoPreview({ file }: { file: File }) {
  const [previewUrl] = useState(() => URL.createObjectURL(file))

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <img
      src={previewUrl}
      alt={`Vista previa de ${file.name}`}
      className="h-40 w-full rounded-xl object-cover"
    />
  )
}

function validateResolutionPhoto(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "La fotografía debe ser JPG, PNG o WebP."
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "La fotografía no puede superar 5 MB."
  }

  return null
}

/**
 * Resolution curation dialog shown when admins close incidents.
 *
 * Captures the resolution photograph and description required to close the
 * ticket. `is_public` only controls Community Board visibility; the citizen
 * always receives the resolution content in their own cases view.
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
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [resolutionSummary, setResolutionSummary] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const resetForm = () => {
    setIsPublic(false)
    setResolutionSummary("")
    setPhoto(null)
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedSummary = resolutionSummary.trim()

    if (!photo) {
      setFormError("Adjunta la fotografía de la resolución.")
      return
    }

    if (trimmedSummary.length < 10) {
      setFormError("La descripción de la resolución debe tener al menos 10 caracteres.")
      return
    }

    setFormError(null)
    await onSubmit({
      isPublic,
      resolutionSummary: trimmedSummary,
      photo,
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar incidencia</DialogTitle>
          <DialogDescription>
            Incidencia: <span className="font-medium text-foreground">{incidentTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="resolution-photo">Fotografía de resolución</Label>
            <input
              ref={photoInputRef}
              id="resolution-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  return
                }

                const validationError = validateResolutionPhoto(file)
                if (validationError) {
                  setPhoto(null)
                  setFormError(validationError)
                  return
                }

                setFormError(null)
                setPhoto(file)
              }}
            />
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-gray-400 transition-all hover:border-gray-300"
            >
              {photo ? (
                <ImagePlus className="size-7 text-indigo-500" aria-hidden="true" />
              ) : (
                <Camera className="size-7" aria-hidden="true" />
              )}
              <span className="text-sm">
                {photo ? "Foto adjuntada" : "Adjuntar fotografía de la resolución"}
              </span>
            </button>
            {photo && (
              <ResolutionPhotoPreview
                key={`${photo.name}-${photo.lastModified}-${photo.size}`}
                file={photo}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution-summary">Descripción de la resolución</Label>
            <Textarea
              id="resolution-summary"
              placeholder="Describe la acción realizada para resolver la incidencia."
              value={resolutionSummary}
              onChange={(event) => setResolutionSummary(event.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="public-toggle">Hacer visible para la comunidad</Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

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
