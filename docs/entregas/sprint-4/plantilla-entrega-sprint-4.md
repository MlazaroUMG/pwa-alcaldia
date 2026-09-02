# Plantilla de entrega Sprint 4

## Alcance evaluado

Sprint 4 corresponde a **dashboard administrativo y conexión bidireccional PWA <-> DB**. El objetivo es cerrar el ciclo: el administrador gestiona y resuelve incidencias, el ciudadano ve el estado y la resolución, y la PWA no rompe la sesión con errores crudos al quedar offline.

No se modifica `PlantillaEntrega.xlsx`. Esta matriz contiene valores sugeridos para copiar en las celdas amarillas de `REPORTE`, `FUNCIONES` y `PRUEBAS`.

## REPORTE

| Celda sugerida | Campo | Valor para copiar |
| --- | --- | --- |
| B6 | Código del proyecto | PWA-ALCALDIA-Z18 |
| B7 | Nombre del proyecto | Sistema de Gestión de Incidencias - Alcaldía Auxiliar Zona 18 |
| B8 | Responsable | Marvin Lázaro / Equipo PG2 |
| B9 | Tipo de solución | Aplicacion movil/PWA |
| B10 | Tecnologías principales | React 19, Vite 8, TypeScript, Tailwind CSS 4, shadcn/ui, Leaflet/OpenStreetMap, Supabase Auth/Database/Storage, Service Worker, GitHub Actions, Vercel |
| B11 | Metodología | Agile/Scrum con backlog gestionado en Jira |
| B12 | Versión actual | Sprint 4 - v0.4.0 dashboard administrativo y resolución con foto |
| B13 | Hito actual | Incremento funcional |
| B14 | Última actualización | 2026-08-31 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 95 |
| E9 | Integración % | 90 |
| E11 | Despliegue % | 90 |
| E12 | Evidencias y respaldos % | 90 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | No |
| B21 | Defectos críticos | 0 |
| B22 | Defectos altos | 0 |
| B23 | Atraso (días) | 0 |
| E17 | Próximo entregable | Sprint 5: Community Board, roles y pulido de publicación |
| E18 | Fecha compromiso | 2026-09-12 |
| E19 | Bloqueo actual | La PWA offline cubre el shell, no datos dinámicos de Supabase |
| E20 | Plan de contingencia | Mensaje controlado de sin conexión; role cacheado en sessionStorage para no bloquear el layout si profiles falla |
| E21 | Evidencia principal / URL | `AdminTicketTable.tsx`, `AdminTicketsBoardView.tsx`, `ResolveIncidentDialog.tsx`, `public/sw.js`, migración `202608311430_add_incident_resolution_image.sql`, `npm run lint` / `npm run build` |
| E22 | Resumen del avance semanal | Se corrigió el Service Worker offline, se paginó Incidencias (5/10/25/50), el detalle administrativo quedó compartido entre tabla y Kanban, cada columna del tablero scrollea por separado y el cierre exige foto y descripción de resolución. |

### Evidencia global recomendada

- Captura de Jira con Sprint 4 y `STORY-4.1` a `STORY-4.4`.
- Captura desktop de Incidencias con paginación V3 y selector de resultados.
- Captura del popup de detalle con botón Descargar imagen.
- Captura del Tablero: popup al hacer click, avance de estado y scroll por columna.
- Captura del dialog de cierre con foto de resolución y descripción.
- Captura de Mis tickets mostrando la foto de resolución (no la evidencia original).
- Captura de DevTools Application con Service Worker v2 y recarga offline sin `TypeError: Failed to fetch`.
- Captura de `npm run lint` / `npm run build` sin errores.

## FUNCIONES

| ID | Módulo | Funcionalidad | Prioridad | Estado | Peso | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Administrativo | Listado centralizado de incidencias con paginación | Obligatoria | Terminada y probada | 1 | Sí | `AdminTicketTable.tsx`, `IncidentsPagination.tsx`, 5/10/25/50 |
| F-02 | Administrativo | Cambio de estado Recibido a En proceso | Obligatoria | Terminada y probada | 1 | Sí | Tablero Kanban y popup de detalle |
| F-03 | Administrativo | Cierre con fotografía y descripción de resolución | Obligatoria | Terminada y probada | 1 | Sí | `ResolveIncidentDialog.tsx`, columna `resolution_image_url` |
| F-04 | Ciudadano | Seguimiento de estado y resolución final | Obligatoria | Terminada y probada | 1 | Sí | `MyCasesView.tsx` muestra foto y texto de resolución |
| F-05 | PWA | Service Worker offline sin uncaught Failed to fetch | Obligatoria | Terminada y probada | 1 | Sí | `public/sw.js` cache v2, `src/lib/network-errors.ts` |
| F-06 | Administrativo | Categoría en tabla sin óvalo, mismo estilo que Dependencia | Deseable | Terminada y probada | 1 | Sí | `AdminTicketTable.tsx` |
| F-07 | Administrativo | Descarga de evidencia desde el popup de Incidencias | Deseable | Terminada y probada | 1 | Sí | `IncidentDetailDialog.tsx` |
| F-08 | Administrativo | Popup de detalle en el Tablero con avance de estado | Deseable | Terminada y probada | 1 | Sí | `AdminTicketsBoardView.tsx` |
| F-09 | Administrativo | Scroll independiente por columna del Kanban | Deseable | Terminada y probada | 1 | Sí | Columnas `overflow-y-auto` con altura limitada |
| F-10 | Comunidad | Muro público usa foto de resolución, no evidencia original | Obligatoria | Funciona sin pruebas | 1 | No | `CommunityBoard.tsx`, `AdminCommunityWallView.tsx` |

### Evidencia por función

- `F-01`, `F-06`, `F-07`: capturas desktop de Incidencias, paginación y descarga.
- `F-02`, `F-08`, `F-09`: capturas del Tablero con popup, avance y scroll por columna.
- `F-03`: captura del dialog de cierre y de la columna en Supabase.
- `F-04`, `F-10`: capturas de Mis tickets y muro comunitario.
- `F-05`: captura de DevTools offline sin error crudo.

## PRUEBAS

| ID | ID función | Tipo de prueba | Descripción | Resultado esperado | Estado | Severidad | Evidencia / URL | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Funcional | Cambiar resultados por página y navegar | 5/10/25/50 recortan el listado; Anterior/Siguiente y números funcionan | Aprobada | Alta | `IncidentsPagination.tsx` | 2026-08-31 |
| T-02 | F-03 | Funcional | Cerrar incidencia sin foto o sin descripción | El envío se bloquea; con foto JPEG/PNG/WebP ≤ 5 MB y texto se persiste | Aprobada | Alta | `ResolveIncidentDialog.tsx` | 2026-08-31 |
| T-03 | F-02 | Funcional | Avanzar estado desde popup del Kanban | Pendiente pasa a En proceso; En proceso abre el dialog de resolución | Aprobada | Alta | `AdminTicketsBoardView.tsx` | 2026-08-31 |
| T-04 | F-04 | Integración | Ciudadano ve resolución real | Mis tickets muestra `resolution_image_url` y el resumen, no la evidencia original | Aprobada | Alta | `MyCasesView.tsx` | 2026-08-31 |
| T-05 | F-05 | Integración | Recarga offline del shell | No hay uncaught en `sw.js`; la UI explica la falta de red | Aprobada | Alta | `public/sw.js`, `App.tsx` | 2026-08-31 |
| T-06 | F-06 | Usuario | Categoría sin óvalo blanco | El texto coincide en color y fuente con Dependencia y Tipo de llamada | Aprobada | Media | `AdminTicketTable.tsx` | 2026-08-31 |
| T-07 | F-07 | Usuario | Descargar imagen desde Incidencias | Se descarga o se abre en nueva pestaña si CORS lo impide | Aprobada | Media | `downloadIncidentImage` | 2026-08-31 |
| T-08 | F-09 | Usuario | Scroll por columna | Una columna larga no alarga el layout general | Aprobada | Media | `AdminTicketsBoardView.tsx` | 2026-08-31 |
| T-09 | F-10 | Regresión | Anonimización del muro | El muro no muestra `user_id`, coordenadas ni descripción original | No ejecutada | Alta | Prueba visual pendiente con caso publicado | 2026-08-31 |
| T-10 | F-01 | Integración | Lint y build | `npm run lint` y `npm run build` finalizan sin errores | Aprobada | Media | Consola local / CI | 2026-08-31 |

### Evidencia por prueba

- Para `T-01` a `T-04` y `T-06` a `T-08`: capturas desktop/mobile con datos ficticios.
- Para `T-05`: captura de DevTools Application > Service Workers y recarga offline.
- Para `T-09`: captura del muro sin datos personales.
- Para `T-10`: salida de lint y build.
- No adjuntar `.env`, tokens ni filas con datos reales de ciudadanos.

## Recomendación para Jira

Actualizar Sprint 4 con estas evidencias:

- `STORY-4.1`: captura del listado paginado.
- `STORY-4.2`: captura del cambio Recibido → En proceso.
- `STORY-4.3`: captura del cierre con foto y descripción.
- `STORY-4.4`: captura de Mis tickets con resolución.
- Adjuntar enlace del pull request y del despliegue Vercel.

## Brechas conocidas

- La PWA offline no cachea tiles de OpenStreetMap, Storage ni consultas a Supabase.
- Las incidencias resueltas antes de esta migración pueden no tener `resolution_image_url`; el muro no reutiliza la evidencia original.
- La expiración automática de 30 días del Community Board sigue fuera de este sprint.
- Detección de duplicados e IA permanecen en fase futura.
