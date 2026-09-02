const OFFLINE_MESSAGE =
  "Sin conexión. El tablero y los reportes no se pueden actualizar hasta que vuelva internet."

function readErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message
    return typeof message === "string" ? message : ""
  }

  return ""
}

/**
 * Detecta fallos de red del navegador o de fetch, incluyendo el mensaje
 * crudo `Failed to fetch` que PostgREST/Supabase reenvía al cliente.
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true
  }

  const normalized = readErrorMessage(error).toLowerCase()

  return (
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("err_internet_disconnected") ||
    normalized.includes("fetch failed") ||
    normalized.includes("network request failed")
  )
}

/**
 * Traduce errores técnicos de red a un mensaje en español para la UI.
 * Los demás errores conservan su mensaje original si existe.
 */
export function toUserFacingError(error: unknown, fallback?: string): string {
  if (isNetworkError(error)) {
    return OFFLINE_MESSAGE
  }

  const message = readErrorMessage(error).trim()
  return message || fallback || "Ocurrió un error inesperado."
}
