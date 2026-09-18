import { z } from "zod"

import { FIELD_LIMITS } from "@/lib/validation/limits"
import {
  INCIDENT_TEXT_PATTERN,
  PERSON_NAME_PATTERN,
  collapseWhitespace,
  hasEnoughLetters,
  isRepeatedCharacter,
  isSequentialDigits,
  normalizeIncidentText,
  normalizePersonName,
} from "@/lib/validation/text"

function requiredMessage(field: string) {
  return `${field} es obligatorio.`
}

export const personNameSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage(label))
    .transform(normalizePersonName)
    .pipe(
      z
        .string()
        .min(min, `${label} debe tener al menos ${min} caracteres.`)
        .max(max, `${label} no puede superar ${max} caracteres.`)
        .regex(
          PERSON_NAME_PATTERN,
          `${label} solo admite letras, espacios internos, apóstrofo o guion.`
        )
        .refine((value) => !/\d/.test(value), {
          message: `${label} no puede contener números.`,
        })
        .refine((value) => !isRepeatedCharacter(value.replace(/\s/g, "")), {
          message: `${label} no puede repetir el mismo carácter.`,
        })
    )

export const firstNameSchema = personNameSchema(
  "El nombre",
  FIELD_LIMITS.firstName.min,
  FIELD_LIMITS.firstName.max
)

export const lastNameSchema = personNameSchema(
  "El apellido",
  FIELD_LIMITS.lastName.min,
  FIELD_LIMITS.lastName.max
)

export const emailSchema = z
  .string()
  .trim()
  .min(1, "El correo es obligatorio.")
  .max(FIELD_LIMITS.email.max, "El correo es demasiado largo.")
  .email("Ingresa un correo válido.")
  .transform((value) => value.toLowerCase())

export const dpiSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{13}$/, "El DPI debe tener exactamente 13 dígitos.")
  .refine((value) => !isRepeatedCharacter(value), {
    message: "El DPI no puede usar el mismo dígito repetido.",
  })
  .refine((value) => !isSequentialDigits(value), {
    message: "El DPI no puede ser una secuencia trivial.",
  })

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{8}$/, "El teléfono debe tener exactamente 8 dígitos.")
  .refine((value) => !isRepeatedCharacter(value), {
    message: "El teléfono no puede usar el mismo dígito repetido.",
  })
  .refine((value) => !isSequentialDigits(value), {
    message: "El teléfono no puede ser una secuencia trivial.",
  })

export const addressSchema = z
  .string()
  .trim()
  .transform(collapseWhitespace)
  .pipe(
    z
      .string()
      .min(
        FIELD_LIMITS.address.min,
        `La dirección debe tener al menos ${FIELD_LIMITS.address.min} caracteres.`
      )
      .max(
        FIELD_LIMITS.address.max,
        `La dirección no puede superar ${FIELD_LIMITS.address.max} caracteres.`
      )
      .regex(
        INCIDENT_TEXT_PATTERN,
        "La dirección contiene caracteres no permitidos."
      )
  )

export const optionalAddressSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? "" : collapseWhitespace(value)))
  .refine(
    (value) =>
      value.length === 0 ||
      (value.length >= FIELD_LIMITS.address.min &&
        value.length <= FIELD_LIMITS.address.max &&
        INCIDENT_TEXT_PATTERN.test(value)),
    {
      message: `La dirección debe tener entre ${FIELD_LIMITS.address.min} y ${FIELD_LIMITS.address.max} caracteres válidos.`,
    }
  )

export const incidentTitleSchema = z
  .string()
  .trim()
  .min(1, "El título es obligatorio.")
  .transform(normalizeIncidentText)
  .pipe(
    z
      .string()
      .min(
        FIELD_LIMITS.title.min,
        `El título debe tener al menos ${FIELD_LIMITS.title.min} caracteres.`
      )
      .max(
        FIELD_LIMITS.title.max,
        `El título no puede superar ${FIELD_LIMITS.title.max} caracteres.`
      )
      .regex(INCIDENT_TEXT_PATTERN, "El título contiene caracteres no permitidos.")
      .refine((value) => hasEnoughLetters(value, 4), {
        message: "El título debe incluir al menos 4 letras.",
      })
      .refine((value) => !isRepeatedCharacter(value.replace(/[\s\p{P}]/gu, "")), {
        message: "El título no puede repetir el mismo carácter.",
      })
  )

export const incidentDescriptionSchema = z
  .string()
  .trim()
  .min(1, "La descripción es obligatoria.")
  .transform(normalizeIncidentText)
  .pipe(
    z
      .string()
      .min(
        FIELD_LIMITS.description.min,
        `La descripción debe tener al menos ${FIELD_LIMITS.description.min} caracteres.`
      )
      .max(
        FIELD_LIMITS.description.max,
        `La descripción no puede superar ${FIELD_LIMITS.description.max} caracteres.`
      )
      .regex(
        INCIDENT_TEXT_PATTERN,
        "La descripción contiene caracteres no permitidos."
      )
      .refine((value) => hasEnoughLetters(value, 8), {
        message: "La descripción debe incluir al menos 8 letras.",
      })
  )

export const resolutionSummarySchema = z
  .string()
  .trim()
  .min(1, "El resumen de resolución es obligatorio.")
  .transform(normalizeIncidentText)
  .pipe(
    z
      .string()
      .min(
        FIELD_LIMITS.resolutionSummary.min,
        `El resumen debe tener al menos ${FIELD_LIMITS.resolutionSummary.min} caracteres.`
      )
      .max(
        FIELD_LIMITS.resolutionSummary.max,
        `El resumen no puede superar ${FIELD_LIMITS.resolutionSummary.max} caracteres.`
      )
      .regex(INCIDENT_TEXT_PATTERN, "El resumen contiene caracteres no permitidos.")
  )

export const searchQuerySchema = z
  .string()
  .max(FIELD_LIMITS.search.max, "La búsqueda es demasiado larga.")
  .transform((value) => value.replace(/[<>]/g, "").trim())

export const discardReasonSchema = z
  .string()
  .trim()
  .min(
    FIELD_LIMITS.discardReason.min,
    "Indica un motivo de al menos 8 caracteres."
  )
  .max(
    FIELD_LIMITS.discardReason.max,
    `El motivo no puede superar ${FIELD_LIMITS.discardReason.max} caracteres.`
  )

export const discardNoteSchema = z
  .string()
  .trim()
  .max(
    FIELD_LIMITS.discardNote.max,
    `La nota no puede superar ${FIELD_LIMITS.discardNote.max} caracteres.`
  )
