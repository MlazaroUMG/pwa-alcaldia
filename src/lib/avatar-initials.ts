function firstLetter(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : ""
}

/**
 * Calcula las iniciales visibles del avatar.
 *
 * Usa la primera letra del nombre y del apellido. Si falta uno, toma dos
 * letras del que exista. Si no hay nombre, usa el correo.
 */
export function getAvatarInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
) {
  const first = firstLetter(firstName)
  const last = firstLetter(lastName)

  if (first && last) {
    return `${first}${last}`
  }

  const availableName = firstName?.trim() || lastName?.trim() || ""
  if (availableName.length >= 2) {
    return availableName.slice(0, 2).toUpperCase()
  }

  if (availableName.length === 1) {
    return `${availableName.toUpperCase()}${availableName.toUpperCase()}`
  }

  const localPart = email?.split("@")[0]?.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]/g, "")
  if (localPart && localPart.length >= 2) {
    return localPart.slice(0, 2).toUpperCase()
  }

  if (email && email.length >= 2) {
    return email.slice(0, 2).toUpperCase()
  }

  return "US"
}
