import { MapContainer, Marker, TileLayer } from "react-leaflet"
import L from "leaflet"
import { ExternalLink } from "lucide-react"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"

import "leaflet/dist/leaflet.css"

const previewMarkerIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPreviewMapProps {
  latitude: number
  longitude: number
  className?: string
}

/**
 * Read-only map preview for a previously captured incident location.
 *
 * Used by citizens to confirm where a report was pinned and by
 * administrators to verify an incident's location without leaving the
 * management views. Interaction is disabled; a link to open the point in
 * Google Maps is provided for a full navigable view.
 *
 * @component
 * @module Citizen
 * @param {LocationPreviewMapProps} props Coordinates to render.
 * @returns {JSX.Element} Non-interactive Leaflet map with an external map link.
 */
export function LocationPreviewMap({
  latitude,
  longitude,
  className,
}: LocationPreviewMapProps) {
  return (
    <div className={className}>
      <div className="h-40 w-full overflow-hidden rounded-lg border border-input">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[latitude, longitude]} icon={previewMarkerIcon} />
        </MapContainer>
      </div>
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        <ExternalLink className="size-3" />
        Ver en Google Maps
      </a>
    </div>
  )
}
