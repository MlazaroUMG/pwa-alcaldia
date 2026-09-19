import { useEffect, useState } from "react"
import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { LocateFixed } from "lucide-react"
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import markerIconUrl from "leaflet/dist/images/marker-icon.png"
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png"

import { Button } from "@/components/ui/button"
import {
  GEOFENCE_OUTSIDE_MESSAGE,
  PINARES_DEL_NORTE_CENTER,
  getPinaresLeafletRing,
  getPinaresMaxBounds,
  isWithinPinaresDelNorte,
} from "@/lib/geo/pinares-del-norte"
import "leaflet/dist/leaflet.css"

// Bundlers do not resolve Leaflet's default marker image paths automatically;
// the icon must be re-registered with the URLs Vite generates for them.
const defaultMarkerIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DEFAULT_CENTER: [number, number] = PINARES_DEL_NORTE_CENTER
const DEFAULT_ZOOM = 15
const MAX_BOUNDS = getPinaresMaxBounds()
const GEOFENCE_RING = getPinaresLeafletRing()

export interface LocationCoordinates {
  latitude: number
  longitude: number
}

interface LocationPickerProps {
  value: LocationCoordinates | null
  onChange: (coordinates: LocationCoordinates) => void
}

interface MapClickHandlerProps {
  onSelect: (coordinates: LocationCoordinates) => void
}

function MapClickHandler({ onSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onSelect({ latitude: event.latlng.lat, longitude: event.latlng.lng })
    },
  })
  return null
}

function getGeolocationErrorMessage(error?: GeolocationPositionError) {
  if (!navigator.geolocation) {
    return "Tu navegador no soporta geolocalización. Selecciona el punto en el mapa."
  }

  if (error && error.code === error.PERMISSION_DENIED) {
    return "El permiso de ubicación fue denegado. Selecciona el punto en el mapa."
  }

  if (error && error.code === error.TIMEOUT) {
    return "La captura GPS tardó demasiado. Selecciona el punto en el mapa o vuelve a intentar."
  }

  return "No se pudo obtener tu ubicación. Selecciónala en el mapa."
}

/**
 * Interactive map for citizens to capture and adjust the exact location of
 * an incident before submitting a report.
 *
 * Attempts to center on the device's current GPS position on mount; if
 * permission is denied or unavailable, it falls back to a default center
 * over Zona 18. The marker can be moved by dragging it or tapping the map,
 * and coordinates are only reported to the parent form once confirmed.
 *
 * @component
 * @module Citizen
 * @param {LocationPickerProps} props Current coordinates and change handler.
 * @returns {JSX.Element} Leaflet map with a draggable marker and a
 * "use current location" action.
 */
export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(() =>
    typeof navigator !== "undefined" && !navigator.geolocation
      ? getGeolocationErrorMessage()
      : null
  )

  const acceptIfInside = (coordinates: LocationCoordinates) => {
    if (!isWithinPinaresDelNorte(coordinates.latitude, coordinates.longitude)) {
      setLocationError(GEOFENCE_OUTSIDE_MESSAGE)
      return false
    }

    setLocationError(null)
    onChange(coordinates)
    return true
  }

  useEffect(() => {
    if (value || !navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        acceptIfInside({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error))
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
    // Runs once on mount only; re-requesting on every `value` change would
    // override manual adjustments made by the citizen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(getGeolocationErrorMessage())
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        acceptIfInside({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
      },
      (error) => {
        setLocationError(getGeolocationErrorMessage(error))
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : DEFAULT_CENTER

  return (
    <div className="space-y-2">
      <div className="h-56 w-full overflow-hidden rounded-lg border border-input sm:h-64">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          maxBounds={MAX_BOUNDS}
          maxBoundsViscosity={1}
          className="h-full w-full"
          key={value ? `${value.latitude}-${value.longitude}` : "default"}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polygon
            positions={GEOFENCE_RING}
            pathOptions={{
              color: "#1700a5",
              weight: 2,
              fillColor: "#72c5e4",
              fillOpacity: 0.12,
            }}
          />
          <MapClickHandler onSelect={acceptIfInside} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              icon={defaultMarkerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target as L.Marker
                  const position = marker.getLatLng()
                  const accepted = acceptIfInside({
                    latitude: position.lat,
                    longitude: position.lng,
                  })

                  if (!accepted && value) {
                    marker.setLatLng([value.latitude, value.longitude])
                  }
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="border-gray-400 text-gray-800 hover:bg-gray-100"
        >
          <LocateFixed className="size-4" />
          {isLocating ? "Ubicando..." : "Usar mi ubicación actual"}
        </Button>

        {value && (
          <p className="text-xs text-muted-foreground">
            Lat: {value.latitude.toFixed(5)}, Lng: {value.longitude.toFixed(5)}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Toca el mapa o arrastra el marcador para ajustar el punto exacto del
        incidente. Solo se aceptan puntos dentro de Pinares del Norte, Zona 18,
        Distrito IV.
      </p>

      {locationError && (
        <p className="text-sm text-destructive">{locationError}</p>
      )}
    </div>
  )
}
