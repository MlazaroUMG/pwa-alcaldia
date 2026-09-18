import { z } from "zod"

import {
  CONSENT_VERSION,
  dpiSchema,
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  optionalAddressSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/validation"

/**
 * Validation schema for new citizen registrations.
 *
 * DPI and phone remain required so administrators can verify identity.
 * Address is optional. Consent is persisted with a versioned legal draft.
 */
export const registerFormSchema = z
  .object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    dpi: dpiSchema,
    phone: phoneSchema,
    address: optionalAddressSchema,
    acceptedTerms: z.boolean().refine((value) => value === true, {
      message: "Debes aceptar el aviso de privacidad y las reglas de uso.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>

export const REGISTER_CONSENT_VERSION = CONSENT_VERSION
