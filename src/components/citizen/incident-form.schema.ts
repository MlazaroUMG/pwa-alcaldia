import { z } from "zod"

import {
  INCIDENT_CATEGORIES,
  INCIDENT_DEPENDENCIES,
  getCallTypeByCode,
  isValidCallTypeForDependency,
  type IncidentCategory,
  type IncidentDependency,
} from "@/lib/incident-classification"

export { INCIDENT_CATEGORIES, INCIDENT_DEPENDENCIES }

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024

export const incidentFormSchema = z
  .object({
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
    dependency: z
      .enum(INCIDENT_DEPENDENCIES, {
        message: "Selecciona la dependencia responsable.",
      })
      .optional(),
    callTypeCode: z
      .number({
        message: "Selecciona el tipo de llamada.",
      })
      .optional(),
    callTypeLabel: z.string().trim().min(1, "Selecciona el tipo de llamada."),
    photo: z
      .instanceof(File, { message: "El archivo seleccionado no es válido." })
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
        "La fotografía debe ser JPG, PNG o WebP."
      )
      .refine(
        (file) => file.size <= MAX_PHOTO_SIZE_BYTES,
        "La fotografía no puede superar 5 MB."
      )
      .optional(),
    latitude: z.number({
      message: "Captura la ubicación del incidente en el mapa.",
    }),
    longitude: z.number({
      message: "Captura la ubicación del incidente en el mapa.",
    }),
  })
  .superRefine((values, context) => {
    if (!values.dependency) {
      context.addIssue({
        code: "custom",
        path: ["dependency"],
        message: "Selecciona la dependencia responsable.",
      })
      return
    }

    if (values.callTypeCode === undefined) {
      context.addIssue({
        code: "custom",
        path: ["callTypeCode"],
        message: "Selecciona el tipo de llamada.",
      })
      return
    }

    if (!isValidCallTypeForDependency(values.dependency, values.callTypeCode)) {
      context.addIssue({
        code: "custom",
        path: ["callTypeCode"],
        message: "El tipo de llamada no corresponde a la dependencia seleccionada.",
      })
      return
    }

    const callType = getCallTypeByCode(values.dependency, values.callTypeCode)

    if (callType?.label !== values.callTypeLabel) {
      context.addIssue({
        code: "custom",
        path: ["callTypeCode"],
        message: "El tipo de llamada seleccionado no es válido.",
      })
    }
  })

export type IncidentFormValues = z.infer<typeof incidentFormSchema>

export interface IncidentSubmissionPayload {
  title: string
  description: string
  category: IncidentCategory
  dependency: IncidentDependency
  callTypeCode: number
  callTypeLabel: string
  photo: File | null
  latitude: number
  longitude: number
}
