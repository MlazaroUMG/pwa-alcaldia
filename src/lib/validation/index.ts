export { FIELD_LIMITS, CONSENT_VERSION, MAX_PHOTO_SIZE_BYTES, ACCEPTED_IMAGE_TYPES } from "@/lib/validation/limits"
export {
  firstNameSchema,
  lastNameSchema,
  emailSchema,
  dpiSchema,
  phoneSchema,
  addressSchema,
  optionalAddressSchema,
  incidentTitleSchema,
  incidentDescriptionSchema,
  resolutionSummarySchema,
  searchQuerySchema,
  discardReasonSchema,
  discardNoteSchema,
} from "@/lib/validation/fields"
export { passwordSchema, loginPasswordSchema, getPasswordIssues } from "@/lib/validation/password"
export { assertValidImageFile, detectImageMime, getImageValidationError } from "@/lib/validation/image"
export { collapseWhitespace, utf8ByteLength } from "@/lib/validation/text"
