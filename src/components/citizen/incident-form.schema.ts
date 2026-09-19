import { z } from "zod"

import {
  INCIDENT_CATEGORIES,
  INCIDENT_DEPENDENCIES,
  getCallTypeByCode,
  isValidCallTypeForDependency,
  type IncidentCategory,
  type IncidentDependency,
} from "@/lib/incident-classification"
import {
  GEOFENCE_OUTSIDE_MESSAGE,
  isWithinPinaresDelNorte,
} from "@/lib/geo/pinares-del-norte"
import {
  FIELD_LIMITS,
  getImageValidationError,
  incidentDescriptionSchema,
  incidentTitleSchema,
} from "@/lib/validation"

export { INCIDENT_CATEGORIES, INCIDENT_DEPENDENCIES }

export const incidentFormSchema = z
  .object({
    title: incidentTitleSchema,
    description: incidentDescriptionSchema,
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
      .refine((file) => getImageValidationError(file) === null, {
        message: "La fotografía debe ser JPG, PNG o WEBP y no superar 5 MB.",
      })
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

    if (
      typeof values.latitude === "number" &&
      typeof values.longitude === "number" &&
      !isWithinPinaresDelNorte(values.latitude, values.longitude)
    ) {
      context.addIssue({
        code: "custom",
        path: ["latitude"],
        message: GEOFENCE_OUTSIDE_MESSAGE,
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

export const INCIDENT_FIELD_LIMITS = FIELD_LIMITS
