import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from "@/lib/validation/limits"

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff]
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function matchesSignature(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value)
}

export function detectImageMime(bytes: Uint8Array) {
  if (bytes.length < 12) {
    return null
  }

  if (matchesSignature(bytes, JPEG_SIGNATURE)) {
    return "image/jpeg"
  }

  if (matchesSignature(bytes, PNG_SIGNATURE)) {
    return "image/png"
  }

  const header = String.fromCharCode(...bytes.slice(0, 4))
  const webpTag = String.fromCharCode(...bytes.slice(8, 12))
  if (header === "RIFF" && webpTag === "WEBP") {
    return "image/webp"
  }

  return null
}

export function isAllowedImageExtension(fileName: string) {
  const lowerName = fileName.toLowerCase()
  return ACCEPTED_IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
}

export function getImageValidationError(file: File) {
  if (!isAllowedImageExtension(file.name)) {
    return "Solo se admiten fotografías JPG, PNG o WEBP."
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]) && file.type !== "") {
    return "El tipo de archivo no corresponde a una fotografía permitida."
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return "La fotografía no puede superar 5 MB."
  }

  if (file.size < 32) {
    return "La fotografía está vacía o dañada."
  }

  return null
}

export async function assertValidImageFile(file: File) {
  const surfaceError = getImageValidationError(file)
  if (surfaceError) {
    throw new Error(surfaceError)
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const detected = detectImageMime(header)

  if (!detected) {
    throw new Error("El archivo no es una fotografía válida.")
  }

  if (file.type && file.type !== detected) {
    throw new Error("El contenido de la fotografía no coincide con su tipo.")
  }
}
