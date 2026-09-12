import type { IncidentSubmissionPayload } from "@/components/citizen/incident-form.schema"
import { supabase } from "@/lib/supabaseClient"

export interface DuplicateSuggestion {
  category: string
  call_type_code: number | null
  call_type_label: string | null
  approximate_distance_m: number
  text_similarity: number
  created_at: string
}

export async function fetchDuplicateSuggestions(
  incident: IncidentSubmissionPayload
) {
  const { data, error } = await supabase.rpc("suggest_incident_duplicates", {
    input_latitude: incident.latitude,
    input_longitude: incident.longitude,
    input_description: incident.description,
    input_category: incident.category,
    input_dependency: incident.dependency,
    input_call_type_code: incident.callTypeCode,
  })

  return {
    suggestions: (data ?? []) as DuplicateSuggestion[],
    error,
  }
}

export function getSuggestedPriority(category: string, createdAt?: string) {
  const highPriorityCategories = new Set([
    "Agua potable",
    "Drenajes y alcantarillado",
    "Infraestructura vial",
  ])
  const isOlderThanThreeDays =
    createdAt !== undefined &&
    Date.now() - new Date(createdAt).getTime() > 3 * 24 * 60 * 60 * 1000

  return highPriorityCategories.has(category) || isOlderThanThreeDays
    ? "Alta"
    : "Media"
}

interface ComparableIncident {
  id: string
  description: string
  category: string
  dependency: string | null
  call_type_code: number | null
  status: string
  created_at: string
  latitude: number | null
  longitude: number | null
}

function tokenSimilarity(first: string, second: string) {
  const normalize = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .split(/\W+/)
        .filter((token) => token.length > 2)
    )
  const firstTokens = normalize(first)
  const secondTokens = normalize(second)
  const union = new Set([...firstTokens, ...secondTokens])
  const intersection = [...firstTokens].filter((token) => secondTokens.has(token))

  return union.size === 0 ? 0 : intersection.length / union.size
}

function distanceInMeters(first: ComparableIncident, second: ComparableIncident) {
  if (
    first.latitude === null ||
    first.longitude === null ||
    second.latitude === null ||
    second.longitude === null
  ) {
    return Number.POSITIVE_INFINITY
  }

  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(second.latitude - first.latitude)
  const longitudeDelta = toRadians(second.longitude - first.longitude)
  const firstLatitude = toRadians(first.latitude)
  const secondLatitude = toRadians(second.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return 6371000 * 2 * Math.asin(Math.sqrt(haversine))
}

export function findPossibleDuplicateIds(incidents: ComparableIncident[]) {
  const candidates = incidents.filter(
    (incident) =>
      incident.status !== "Resuelto" &&
      Date.now() - new Date(incident.created_at).getTime() <=
        14 * 24 * 60 * 60 * 1000
  )
  const duplicateIds = new Set<string>()

  for (let firstIndex = 0; firstIndex < candidates.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < candidates.length;
      secondIndex += 1
    ) {
      const first = candidates[firstIndex]
      const second = candidates[secondIndex]
      if (distanceInMeters(first, second) > 80) {
        continue
      }

      const matchesClassification =
        first.call_type_code !== null &&
        first.call_type_code === second.call_type_code &&
        first.dependency === second.dependency
      const matchesText =
        first.category === second.category &&
        tokenSimilarity(first.description, second.description) >= 0.25

      if (matchesClassification || matchesText) {
        duplicateIds.add(first.id)
        duplicateIds.add(second.id)
      }
    }
  }

  return duplicateIds
}
