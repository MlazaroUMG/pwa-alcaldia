# Registro de defectos del cierre

No se registran credenciales, DPI ni datos personales reales.

| ID | Fecha | Área | Severidad | Descripción | Estado |
| --- | --- | --- | --- | --- | --- |
| DEF-01 | 2026-09-18 | Tema | Media | El tema se perdía al recargar porque el efecto escribía `light` antes de leer `localStorage`. | Corregido |
| DEF-02 | 2026-09-18 | Avatar | Baja | El avatar usaba las dos primeras letras del correo. | Corregido |
| DEF-03 | 2026-09-18 | Contraste | Media | Dependencia, tipo de llamada e icono Luna quedaban casi blancos en modo claro. | Corregido |
| DEF-04 | 2026-09-18 | Fotos | Media | `object-cover` recortaba fotografías verticales en detalle, resolución y muro. | Corregido |
| DEF-05 | 2026-09-18 | Geolocalización | Alta (alcance) | El mapa aceptaba cualquier coordenada. | Mitigado en cliente; CHECK SQL aplazado |
| DEF-06 | 2026-09-18 | Auditoría | Media | Las transiciones de estado no se escribían en `incident_audit_events`. | Corregido (código + política INSERT remota) |
| DEF-07 | 2026-09-18 | Auth | Baja | Recuperación y reset heredaban tokens `dark` del `html`. | Corregido |

## Deuda explícita

- Un cliente podría insertar coordenadas fuera de la geocerca si evita el formulario.
- TypeScript `strict` no está activo.
- Las 30 muestras reales no forman parte de este ciclo.
- Production HTTPS existe; el SHA `e1e8b12` aún no lleva `vercel.json`.
