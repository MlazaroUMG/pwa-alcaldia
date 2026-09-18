export const FIELD_LIMITS = {
  firstName: { min: 2, max: 60 },
  lastName: { min: 2, max: 80 },
  address: { min: 5, max: 160 },
  email: { max: 254 },
  password: { min: 12, maxChars: 64, maxBytes: 72 },
  dpi: { length: 13 },
  phone: { length: 8 },
  title: { min: 5, max: 100 },
  description: { min: 20, max: 500 },
  resolutionSummary: { min: 10, max: 500 },
  search: { max: 100 },
  discardReason: { min: 8, max: 160 },
  discardNote: { max: 240 },
} as const

export const CONSENT_VERSION = "2026-09-16"
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const
