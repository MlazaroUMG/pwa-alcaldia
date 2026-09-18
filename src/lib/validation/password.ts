import { z } from "zod"

import { FIELD_LIMITS } from "@/lib/validation/limits"
import { utf8ByteLength } from "@/lib/validation/text"

const PASSWORD_CLASSES = {
  upper: /[A-ZÁÉÍÓÚÜÑ]/,
  lower: /[a-záéíóúüñ]/,
  number: /\d/,
  symbol: /[^\p{L}\p{N}\s]/u,
}

export function getPasswordIssues(value: string) {
  const issues: string[] = []

  if (value.length < FIELD_LIMITS.password.min) {
    issues.push(`Usa al menos ${FIELD_LIMITS.password.min} caracteres.`)
  }

  if (value.length > FIELD_LIMITS.password.maxChars) {
    issues.push(`La contraseña no puede superar ${FIELD_LIMITS.password.maxChars} caracteres.`)
  }

  if (utf8ByteLength(value) > FIELD_LIMITS.password.maxBytes) {
    issues.push("La contraseña es demasiado larga para almacenarse de forma segura.")
  }

  if (!PASSWORD_CLASSES.upper.test(value)) {
    issues.push("Incluye al menos una letra mayúscula.")
  }

  if (!PASSWORD_CLASSES.lower.test(value)) {
    issues.push("Incluye al menos una letra minúscula.")
  }

  if (!PASSWORD_CLASSES.number.test(value)) {
    issues.push("Incluye al menos un número.")
  }

  if (!PASSWORD_CLASSES.symbol.test(value)) {
    issues.push("Incluye al menos un símbolo.")
  }

  return issues
}

export const passwordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria.")
  .superRefine((value, context) => {
    for (const message of getPasswordIssues(value)) {
      context.addIssue({
        code: "custom",
        message,
      })
    }
  })

export const loginPasswordSchema = z
  .string()
  .min(1, "La contraseña es obligatoria.")
  .max(FIELD_LIMITS.password.maxChars, "La contraseña es demasiado larga.")
