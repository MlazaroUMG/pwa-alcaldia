const TICKET_PREFIX = "INC-"

export function formatTicketNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return `${TICKET_PREFIX}${String(value).padStart(6, "0")}`
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value.startsWith(TICKET_PREFIX) ? value : `${TICKET_PREFIX}${value}`
  }

  return "Sin folio"
}

export function matchesTicketQuery(ticketNumber: string | null | undefined, query: string) {
  if (!ticketNumber) {
    return false
  }

  const normalizedQuery = query.trim().toLowerCase()
  return ticketNumber.toLowerCase().includes(normalizedQuery)
}
