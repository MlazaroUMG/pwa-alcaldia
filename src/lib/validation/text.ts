export function utf8ByteLength(value: string) {
  return new TextEncoder().encode(value).length
}

export function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function normalizePersonName(value: string) {
  return collapseWhitespace(value)
}

export function normalizeIncidentText(value: string) {
  return collapseWhitespace(value)
}

export function isRepeatedCharacter(value: string) {
  return /^(.)\1+$/u.test(value)
}

export function isSequentialDigits(value: string) {
  if (!/^\d+$/.test(value) || value.length < 3) {
    return false
  }

  const digits = [...value].map((character) => Number(character))
  const ascending = digits.every(
    (digit, index) => index === 0 || digit === digits[index - 1] + 1
  )
  const descending = digits.every(
    (digit, index) => index === 0 || digit === digits[index - 1] - 1
  )

  return ascending || descending
}

export function hasEnoughLetters(value: string, minimum = 4) {
  const letters = value.match(/\p{L}/gu) ?? []
  return letters.length >= minimum
}

export const PERSON_NAME_PATTERN =
  /^\p{L}(?:[\p{L}\p{M}\u0020'’-]*\p{L})?$/u

export const INCIDENT_TEXT_PATTERN = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u
