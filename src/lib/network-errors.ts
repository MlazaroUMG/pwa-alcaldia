import type { AuthError, PostgrestError } from "@supabase/supabase-js"

type UnknownError = AuthError | PostgrestError | Error | { message?: string; code?: string } | string | null | undefined | unknown

const CODE_MESSAGES: Record<string, string> = {
  "23505": "Ya existe un registro con esos datos. Revisa DPI o correo.",
  "23514": "Uno de los datos no cumple las reglas del sistema.",
  "42501": "No tienes permiso para completar esta acción.",
  "42900": "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
  PGRST116: "No se encontró la información solicitada.",
  PGRST301: "La sesión expiró. Inicia sesión de nuevo.",
  "22P02": "Hay un dato con formato inválido.",
}

const MESSAGE_HINTS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /invalid login credentials/i, message: "Correo o contraseña incorrectos." },
  { pattern: /email not confirmed/i, message: "Confirma tu correo antes de iniciar sesión." },
  { pattern: /user already registered/i, message: "Este correo ya tiene una cuenta." },
  { pattern: /password/i, message: "La contraseña no cumple la política de seguridad." },
  { pattern: /jwt expired|invalid jwt|refresh_token/i, message: "La sesión expiró. Inicia sesión de nuevo." },
  { pattern: /network|failed to fetch|load failed/i, message: "No hay conexión. Revisa tu red e inténtalo otra vez." },
  { pattern: /row-level security|rls/i, message: "No tienes permiso para completar esta acción." },
  { pattern: /duplicate key.*dpi/i, message: "Este DPI ya está registrado." },
  { pattern: /completar el perfil|complete.*profile/i, message: "Completa tu perfil antes de continuar." },
  { pattern: /bucket not found|storage/i, message: "No se pudo guardar la fotografía. Inténtalo de nuevo." },
]

function readErrorParts(error: UnknownError) {
  if (!error) {
    return { code: "", message: "" }
  }

  if (typeof error === "string") {
    return { code: "", message: error }
  }

  const record = error as { code?: string; message?: string; status?: number }
  return {
    code: record.code ?? "",
    message: record.message ?? "",
  }
}

export function toUserFacingError(error: UnknownError, fallback = "No se pudo completar la acción. Inténtalo de nuevo.") {
  const { code, message } = readErrorParts(error)

  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code]
  }

  for (const hint of MESSAGE_HINTS) {
    if (hint.pattern.test(message) || hint.pattern.test(code)) {
      return hint.message
    }
  }

  if (message && !/[./\\]sql|postgres|supabase|stack/i.test(message) && message.length <= 140) {
    return message
  }

  return fallback
}

export function isNetworkError(error: UnknownError) {
  const { message, code } = readErrorParts(error)
  return /network|failed to fetch|load failed|timeout/i.test(`${code} ${message}`)
}
