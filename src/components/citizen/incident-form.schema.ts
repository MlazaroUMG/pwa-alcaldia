import { z } from "zod"

/** Incident categories available to citizens when reporting a problem. */
export const INCIDENT_CATEGORIES = [
  "Agua",
  "Infraestructura",
  "Iluminación",
  "Seguridad",
] as const

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]

export const incidentFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(120, "El título no puede superar 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(1000, "La descripción no puede superar 1000 caracteres."),
  category: z.enum(INCIDENT_CATEGORIES, {
    message: "Selecciona una categoría.",
  }),
  photo: z
    .instanceof(File, { message: "El archivo seleccionado no es válido." })
    .optional(),
  latitude: z.number({
    message: "Captura la ubicación del incidente en el mapa.",
  }),
  longitude: z.number({
    message: "Captura la ubicación del incidente en el mapa.",
  }),
})

export type IncidentFormValues = z.infer<typeof incidentFormSchema>

export interface IncidentSubmissionPayload {
  title: string
  description: string
  category: IncidentCategory
  photo: File | null
  latitude: number
  longitude: number
}
