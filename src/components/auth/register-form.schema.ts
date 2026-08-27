import { z } from "zod"

/**
 * Validation schema for new citizen registrations.
 *
 * DPI (Documento Personal de Identificación) and phone are required so the
 * administrative module can verify a citizen's identity when managing their
 * incidents. Address is intentionally optional per project requirements.
 */
export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ingresa al menos 2 caracteres para el nombre.")
      .max(80, "El nombre no puede superar 80 caracteres."),
    lastName: z
      .string()
      .trim()
      .min(2, "Ingresa al menos 2 caracteres para el apellido.")
      .max(80, "El apellido no puede superar 80 caracteres."),
    email: z.string().trim().email("Ingresa un correo electrónico válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    dpi: z
      .string()
      .trim()
      .regex(/^\d{13}$/, "El DPI debe tener 13 dígitos numéricos."),
    phone: z
      .string()
      .trim()
      .regex(/^\d{8}$/, "El teléfono debe tener 8 dígitos numéricos."),
    address: z
      .string()
      .trim()
      .max(200, "La dirección no puede superar 200 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerFormSchema>
