# ADR 0002: Usar Leaflet y OpenStreetMap para geolocalizacion

## Estado

Aceptado

## Fecha

2026-08-07

## Contexto

El modulo ciudadano requiere que la ubicacion de una incidencia sea obligatoria y capturada mediante un mapa interactivo. El usuario debe poder usar su ubicacion actual, mover el marcador y ajustar manualmente el punto exacto antes de enviar el reporte.

La solucion debe funcionar en un contexto PWA mobile-first y evitar dependencias de proveedores con costo o API keys cuando sea posible.

## Alternativas consideradas

- Usar solo `navigator.geolocation` sin mapa: captura coordenadas, pero no permite corregir visualmente el punto.
- Usar MapLibre GL o mapas vectoriales: ofrece mas capacidades visuales, pero agrega peso y suele requerir un proveedor de tiles o configuracion adicional.
- Usar Google Maps: ampliamente conocido, pero introduce dependencia de API key, politicas de cuota y posible costo.
- Usar Leaflet con tiles publicos de OpenStreetMap: suficiente para captura y vista previa de coordenadas, liviano y sin API key.

## Decision

Se adopta Leaflet con `react-leaflet` y OpenStreetMap para:

- `LocationPicker`, mapa interactivo en el formulario ciudadano.
- `LocationPreviewMap`, mapa de solo lectura para vistas ciudadanas y administrativas.

La ubicacion se guarda en `incidents.latitude` e `incidents.longitude` y se exige desde la validacion del formulario.

## Consecuencias positivas

- Permite captura visual y correccion manual del punto.
- No requiere proveedor comercial ni API key.
- Mantiene el modulo ciudadano mobile-first.
- La misma base permite vista previa para ciudadanos y administradores.

## Consecuencias negativas

- Aumenta el tamaño del bundle por la libreria de mapas.
- Depende de disponibilidad de tiles publicos de OpenStreetMap.
- Para navegacion avanzada o analitica geoespacial podria requerirse una solucion mas robusta en el futuro.

## Referencias relacionadas

- `src/components/citizen/LocationPicker.tsx`.
- `src/components/citizen/LocationPreviewMap.tsx`.
- `src/components/citizen/IncidentSubmissionForm.tsx`.
- `src/components/citizen/incident-form.schema.ts`.
- `AGENTS.md`, secciones 8.2, 8.7 y 18.1.
