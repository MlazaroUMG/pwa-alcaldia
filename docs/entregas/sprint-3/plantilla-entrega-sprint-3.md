# Plantilla de entrega Sprint 3

## Alcance evaluado

Sprint 3 corresponde a **Primer incremento funcional**. El objetivo del backlog es un módulo ciudadano PWA ejecutable y conectado a la base de datos: clasificación de incidencia, fotografía, geolocalización y carga inicial offline.

Este sprint también incorporó un ajuste visual del layout de autenticación y la clasificación operativa municipal (`Dependencia` y `Tipo de llamada`) persistida en Supabase y visible en el módulo administrativo.

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
| B12 | Versión actual | Sprint 3 - v0.3.0 primer incremento funcional PWA |
| B13 | Hito actual | Incremento funcional |
| B14 | Última actualización | 2026-08-28 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 95 |
| E9 | Integración % | 85 |
| E11 | Despliegue % | 90 |
| E12 | Evidencias y respaldos % | 90 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | No |
| B21 | Defectos críticos | 0 |
| B22 | Defectos altos | 1 |
| B23 | Atraso (días) | 6 |
| E17 | Próximo entregable | Sprint 4: dashboard administrativo y conexión bidireccional PWA <-> DB |
| E18 | Fecha compromiso | 2026-09-05 |
| E19 | Bloqueo actual | Google Auth sigue dependiendo de habilitar el provider y redirect URLs en Supabase Dashboard si se quiere demostrar OAuth completo; la PWA offline cubre el shell, no datos dinámicos |
| E20 | Plan de contingencia | Mantener email/password como acceso principal; documentar que tiles OSM, cámara, GPS y consultas a Supabase requieren red |
| E21 | Evidencia principal / URL | `IncidentSubmissionForm.tsx`, `incident-classification.ts`, migración `202608271633_add_incident_classification_fields.sql`, `public/sw.js`, `public/manifest.webmanifest`, despliegue Vercel, `npm run lint` / `npm run build` |
| E22 | Resumen del avance semanal | Se cerró el primer incremento ciudadano: formulario con categoría, dependencia, tipo de llamada, foto y GPS; se persistieron los campos en Supabase; el módulo admin muestra la clasificación; se corrigió el layout de autenticación y la PWA de carga inicial offline quedó desplegada y verificada. |

### Evidencia global recomendada

- Captura de Jira con Sprint 3 y `STORY-3.1`, `STORY-3.2`, `STORY-3.3`, `TASK-3.4`.
- Captura mobile del formulario **Reportar** con dropdowns `Dependencia` y `Tipo de llamada`.
- Captura de una incidencia insertada en Supabase con `category`, `dependency`, `call_type_code`, `call_type_label`, `image_url`, `latitude` y `longitude`, ocultando datos personales.
- Captura de la tabla administrativa **Incidencias** mostrando `Categoría`, `Dependencia` y `Tipo de llamada`, sin columna `Confirmaciones`.
- Captura de login/registro a pantalla completa, sin bandas laterales ni scroll interno en la columna del formulario.
- Captura de `public/manifest.webmanifest` y registro de Service Worker en DevTools.
- Captura del despliegue Vercel y de `npm run lint` / `npm run build` sin errores.
- Captura de `git status` mostrando `.env` fuera del tracking.

## FUNCIONES

| ID | Módulo | Funcionalidad | Prioridad | Estado | Peso | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Ciudadano | Formulario PWA para clasificar incidencia, dependencia y tipo de llamada | Obligatoria | Terminada y probada | 1 | Sí | `IncidentSubmissionForm.tsx`, `incident-classification.ts`, dropdowns dependientes |
| F-02 | Ciudadano | Adjuntar o capturar fotografía de evidencia | Obligatoria | Terminada y probada | 1 | Sí | `capture="environment"`, validación JPEG/PNG/WebP 5 MB, preview, bucket `incident-photos` |
| F-03 | Ciudadano | Captura de coordenadas exactas con GPS y mapa | Obligatoria | Terminada y probada | 1 | Sí | `LocationPicker.tsx`, Leaflet/OpenStreetMap, fallback manual |
| F-04 | PWA | Service Worker y manifest para carga inicial offline | Obligatoria | Terminada y probada | 1 | Sí | `public/sw.js`, `public/manifest.webmanifest`, `src/lib/pwa.ts` |
| F-05 | Autenticación | Layout de login/registro a viewport completo | Obligatoria | Terminada y probada | 1 | Sí | `AuthPage` en `src/App.tsx`; sin `max-h` ni scroll interno |
| F-06 | Administrativo | Visualización de Dependencia y Tipo de llamada en gestión | Obligatoria | Terminada y probada | 1 | Sí | `AdminTicketTable.tsx`; se retiró `Confirmaciones` |
| F-07 | Administrativo | Clasificación visible en tablero, resueltos, bandeja, dashboard y muro | Obligatoria | Funciona sin pruebas | 1 | No | `AdminTicketsBoardView.tsx`, `AdminResolvedView.tsx`, `AdminInboxView.tsx`, `AdminDashboardView.tsx`, `AdminCommunityWallView.tsx` |
| F-08 | Ciudadano | Seguimiento de casos propios con la clasificación refinada | Deseable | Funciona sin pruebas | 1 | No | `MyCasesView.tsx`, `CitizenLayout.tsx` |
| F-09 | Comunidad | Muro comunitario anonimizado con categoría, dependencia y tipo | Deseable | Funciona sin pruebas | 1 | No | `CommunityBoard.tsx`; no expone `user_id`, coordenadas ni descripción original |
| F-10 | Base de datos | Columnas de clasificación en `incidents` con restricciones CHECK | Obligatoria | Terminada y probada | 1 | Sí | Migración `202608271633_add_incident_classification_fields.sql` |
| F-11 | Autenticación | Login email/password y enrutamiento por rol | Obligatoria | Funciona sin pruebas | 1 | No | `LoginForm.tsx`, `App.tsx`; regresión del Sprint 2 |
| F-12 | Administrativo | Shell desktop fullscreen del dashboard | Obligatoria | Funciona sin pruebas | 1 | No | `AdminLayout.tsx`, `#root` fluido; regresión del overhaul visual |

### Evidencia por función

- `F-01` a `F-03`: capturas mobile del formulario Reportar, selector de cámara, mapa GPS y envío exitoso.
- `F-04`: captura de Application > Manifest y Service Workers en DevTools; recarga en modo offline del shell.
- `F-05`: captura desktop de login y crear cuenta comparada con las referencias visuales.
- `F-06` a `F-07`: capturas desktop de Incidencias, Tablero, Resueltos, Bandeja, Dashboard y Muro Público.
- `F-08` a `F-09`: capturas de Mis tickets y muro ciudadano, confirmando que no aparecen DPI, teléfono, coordenadas ni descripción original en el muro.
- `F-10`: captura de columnas nuevas en Table Editor de Supabase, ocultando filas reales.
- `F-11` a `F-12`: capturas de login, redirección por rol y dashboard a pantalla completa.

## PRUEBAS

| ID | ID función | Tipo de prueba | Descripción | Resultado esperado | Estado | Severidad | Evidencia / URL | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Funcional | Clasificar incidencia con dependencia y tipo de llamada | El tipo se habilita al elegir dependencia; al cambiar dependencia se limpia el tipo; combinaciones inválidas se rechazan | Aprobada | Alta | `IncidentSubmissionForm.tsx`, CHECK en migración | 2026-08-28 |
| T-02 | F-02 | Funcional | Adjuntar fotografía válida o inválida | Imagen JPEG/PNG/WebP menor a 5 MB se previsualiza y sube; archivo inválido bloquea el envío | Aprobada | Alta | `incident-form.schema.ts`, preview local, bucket `incident-photos` | 2026-08-28 |
| T-03 | F-03 | Funcional | Captura GPS, permiso denegado y ajuste en mapa | Se guardan coordenadas; si GPS falla o se deniega, el punto se selecciona en el mapa | Aprobada | Alta | `LocationPicker.tsx` | 2026-08-28 |
| T-04 | F-10 | Integración | Persistencia de clasificación en Supabase | La fila incluye `dependency`, `call_type_code`, `call_type_label`, `image_url`, coordenadas, `status = Pendiente` e `is_public = false` | Aprobada | Alta | Columnas confirmadas en proyecto remoto | 2026-08-28 |
| T-05 | F-06 | Usuario | Tabla Incidencias sin Confirmaciones | Aparecen Categoría, Dependencia y Tipo de llamada; el layout no rompe el resto de columnas | Aprobada | Media | `AdminTicketTable.tsx` | 2026-08-28 |
| T-06 | F-04 | Integración | Carga inicial offline del shell PWA | Con Service Worker activo, el shell responde offline; datos dinámicos no se prometen offline | Aprobada | Media | DevTools Application > Service Workers; despliegue verificado | 2026-08-28 |
| T-07 | F-05 | Usuario | Layout de autenticación desktop | Login y registro ocupan una tarjeta centrada, sin scroll interno ni bandas laterales oscuras | Aprobada | Media | `src/App.tsx`, `src/index.css` | 2026-08-28 |
| T-08 | F-11 | Regresión | Login email/password y enrutamiento por rol | Ciudadano entra al módulo PWA; admin entra al dashboard | No ejecutada | Alta | Prueba manual pendiente tras el overhaul de `AuthPage` | 2026-08-28 |
| T-09 | F-09 | Regresión | Anonimización del Community Board | El muro público no muestra `user_id`, coordenadas exactas ni descripción original | No ejecutada | Alta | Prueba visual/RLS pendiente con un caso publicado | 2026-08-28 |
| T-10 | F-12 | Regresión | Dashboard fullscreen, lint y build | El shell ocupa el viewport; `npm run lint` y `npm run build` finalizan sin errores | Aprobada | Media | `src/index.css`, `AdminLayout.tsx`, consola local / CI | 2026-08-28 |

### Evidencia por prueba

- Para `T-01` a `T-05` y `T-07`: capturas mobile/desktop del formulario, tabla admin y login, con datos ficticios.
- Para `T-04`: captura de Table Editor en Supabase mostrando columnas nuevas, sin DPI, correo ni fotos identificables.
- Para `T-06`: captura de DevTools > Application > Service Workers y recarga en modo offline.
- Para `T-08` a `T-09`: capturas de regresión de login por rol y muro comunitario anonimizado.
- Para `T-10`: captura del dashboard a pantalla completa y salida de `npm run lint` / `npm run build`.
- No adjuntar `.env`, tokens ni filas con datos reales de ciudadanos.

## Recomendación para Jira

Actualizar Sprint 3 con estas evidencias:

- `STORY-3.1`: captura del formulario con categoría, dependencia y tipo de llamada.
- `STORY-3.2`: captura de adjunto/cámara y preview de fotografía.
- `STORY-3.3`: captura de GPS/mapa y coordenadas persistidas.
- `TASK-3.4`: captura de manifest + Service Worker y evidencia de instalación/carga inicial offline.
- Adjuntar enlace del pull request mergeado en GitHub y del despliegue Vercel.

## Brechas conocidas

- La PWA offline no cachea tiles de OpenStreetMap, Storage ni consultas a Supabase.
- Google Auth sigue como prueba de concepto hasta habilitar el provider en el Dashboard; no se reporta como función nueva de este sprint.
- Las incidencias creadas antes de la migración pueden tener `dependency` y tipo de llamada nulos; el endurecimiento `NOT NULL` queda para una tarea posterior.
- La expiración automática de 30 días del Community Board sigue fuera de este sprint.
- Detección de duplicados e IA permanecen en fase futura (Sprint 6).
