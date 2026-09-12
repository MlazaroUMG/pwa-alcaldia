# Plantilla de entrega Sprint 6

## Alcance evaluado

Sprint 6 corresponde a **IA de apoyo, PWA instalable y cierre funcional**.
Consolida las funciones cruciales de todo el proyecto y deja una versión
candidata para pruebas de aceptación. Esta matriz contiene valores sugeridos
para copiar en las celdas amarillas de `REPORTE`, `FUNCIONES` y `PRUEBAS`.

## REPORTE

| Celda sugerida | Campo | Valor para copiar |
| --- | --- | --- |
| B6 | Código del proyecto | PWA-ALCALDIA-Z18 |
| B7 | Nombre del proyecto | Sistema de Gestión de Incidencias - Alcaldía Auxiliar Zona 18 |
| B8 | Responsable | Marvin Lázaro / Equipo PG2 |
| B9 | Tipo de solución | Aplicación móvil/PWA y dashboard administrativo |
| B10 | Tecnologías principales | React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui, Leaflet/OpenStreetMap, Supabase Auth/Database/Storage/Edge Functions, Service Worker, Web Push, GitHub Actions y Vercel |
| B11 | Metodología | Agile/Scrum con backlog gestionado en Jira |
| B12 | Versión actual | Sprint 6 - v0.6.0 versión candidata |
| B13 | Hito actual | Versión candidata |
| B14 | Última actualización | 2026-09-11 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 100 |
| E9 | Integración % | 95 |
| E11 | Despliegue % | 90 |
| E12 | Evidencias y respaldos % | 95 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | No |
| B21 | Defectos críticos | 0 conocidos |
| B22 | Defectos altos | 0 conocidos |
| B23 | Atraso (días) | 0 |
| E17 | Próximo entregable | Pruebas de aceptación, configuración remota y cierre técnico |
| E18 | Fecha compromiso | 2026-09-21 |
| E19 | Bloqueo actual | Migraciones y Edge Function aplicadas; faltan secretos VAPID, webhook, Redirect URLs y aceptación móvil |
| E20 | Plan de contingencia | Campana in-app sigue activa si Web Push no está disponible; el muro filtra 30 días aunque cron falle; la IA nunca bloquea automáticamente |
| E21 | Evidencia principal / URL | Migración Sprint 6, ADR 0007, manifest/SW, flujos ciudadano/admin y resultados de lint/build |
| E22 | Resumen del avance semanal | Se completó IA consultiva, expiración no destructiva del muro, PWA con icono, Web Push preparado, alta Google completa, filtros operativos y correcciones de UX. |

## FUNCIONES CRUCIALES DEL PRODUCTO

| ID | Módulo | Funcionalidad | Prioridad | Estado | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Auth / seguridad | Registro e inicio por correo o Google, perfil y roles con RLS | Obligatoria | Implementada | Parcial: falta aceptación OAuth remota | `App.tsx`, formularios Auth, `profiles` |
| F-02 | Ciudadano | Reporte con clasificación, foto, GPS y validación | Obligatoria | Implementada | Sí | `IncidentSubmissionForm.tsx`, Storage, `incidents` |
| F-03 | IA de apoyo | Sugerencia de duplicados y prioridad con confirmación humana | Obligatoria | Implementada y migrada | Parcial: falta aceptación funcional | RPC, `DuplicateIncidentDialog.tsx`, ADR 0007 |
| F-04 | Ciudadano | Mis tickets con seguimiento de tres estados y resolución visual | Obligatoria | Implementada | Sí | `MyCasesView.tsx` |
| F-05 | Administrativo | Bandeja, perfiles, ubicaciones simultáneas y gestión de incidencias | Obligatoria | Implementada | Sí | `AdminInboxView.tsx`, diálogos apilados |
| F-06 | Administrativo | Kanban y transición Pendiente → En Progreso → Resuelto | Obligatoria | Implementada | Sí | `AdminTicketsBoardView.tsx` |
| F-07 | Resolución | Cierre con foto, resumen, fecha y opción de publicación | Obligatoria | Implementada | Sí | `ResolveIncidentDialog.tsx`, Storage |
| F-08 | Muro | Resoluciones anonimizadas, moderación y expiración a 30 días | Obligatoria | Implementada y migrada | Parcial: falta aceptación cron | `get_community_board`, función de despublicación |
| F-09 | Notificaciones | Campana persistida, aviso por ítem y Web Push | Obligatoria | Edge Function desplegada | No: faltan VAPID, webhook y prueba móvil | `NotificationsMenu.tsx`, `send-push`, `sw.js` |
| F-10 | PWA | Instalable, offline básico, iconos y acceso móvil | Obligatoria | Implementada | No: falta aceptación HTTPS/Android | manifest, Service Worker, PNG 192/512 |
| F-11 | Incidencias | Búsqueda, pestañas, paginación y filtros por dependencia/tipo | Deseable | Implementada | Sí | `AdminTicketTable.tsx`, `IncidentsFilterBar.tsx` |
| F-12 | Perfil | Actualización de contacto, apariencia y recuperación de contraseña | Obligatoria | Implementada | Parcial: falta probar redirects remotos | `ProfileSettingsView.tsx`, `ResetPasswordForm.tsx` |

## PRUEBAS CRUCIALES

| ID | ID función | Tipo | Escenario | Resultado esperado | Estado inicial | Severidad | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Seguridad | Ciudadano intenta una acción admin | RLS rechaza lectura/escritura no autorizada | Pendiente de aceptación | Crítica | Policies y sesión citizen |
| T-02 | F-01 | Integración | Google sin DPI/teléfono | Se muestra completar perfil; no entra al módulo | Pendiente de aceptación | Alta | `CompleteGoogleProfileForm.tsx` |
| T-03 | F-02 | Funcional | Enviar reporte válido con GPS/foto | Se crea una incidencia propia y evidencia accesible | Pendiente de aceptación | Crítica | Supabase + captura PWA |
| T-04 | F-02 | Negativa | GPS denegado o formulario inválido | Se explica el error y no se inserta | Pendiente de aceptación | Alta | Formulario ciudadano |
| T-05 | F-03 | Funcional | Reportar a menos de 80 m de caso similar | Aparece sugerencia sanitizada | Pendiente de aceptación | Alta | RPC migrada + diálogo |
| T-06 | F-03 | Funcional | Cancelar / enviar de todos modos | Cancelar no inserta; confirmar crea ticket | Pendiente de aceptación | Alta | Conteo antes/después |
| T-07 | F-05 | Usuario | Abrir dos mapas en Bandeja | Ambos permanecen visibles sin estirar su tarjeta hermana | Pendiente visual | Media | Captura desktop |
| T-08 | F-05 | Usuario | Detalle → perfil/mapa → cerrar hijo | Regresa al detalle sin cerrar ambos | Pendiente visual | Alta | Captura o video |
| T-09 | F-06/F-07 | Integración | Avanzar, resolver y retroceder | Respeta estados; registra/limpia datos según transición | Pendiente de aceptación | Crítica | Fila `incidents` y Storage |
| T-10 | F-08 | Seguridad | Consultar muro como ciudadano | No expone usuario, descripción original ni coordenadas | Aprobada estructuralmente | Crítica | RPC limitada a cinco campos |
| T-11 | F-08 | Funcional | Publicación de 31 días | No se lista y cron pone `is_public=false` sin borrar | Pendiente de aceptación temporal | Alta | SQL y fila conservada |
| T-12 | F-09 | Integración | Cambio de estado con push activo | Llega aviso del sistema y clic abre la PWA | Pendiente de configuración | Alta | Android/iOS instalado |
| T-13 | F-09 | Negativa | Permiso push denegado | Campana in-app continúa funcionando | Pendiente visual | Media | Menú de notificaciones |
| T-14 | F-10 | PWA | Instalar desde Chrome Android HTTPS | Icono muestra escudo y abre en standalone | Pendiente de deploy | Alta | Captura del launcher |
| T-15 | F-11 | Funcional | Filtrar dependencia y tipo | Solo aparecen coincidencias; limpiar restaura lista | Pendiente visual | Media | Vista Incidencias |
| T-16 | Global | Técnica | Ejecutar lint y build | Ambos comandos finalizan sin errores | Aprobada localmente | Alta | `npm run lint`, `npm run build` (2026-09-11) |

## Evidencia global recomendada

- Pull request enfocado en Sprint 6 y checks verdes.
- Capturas móvil del reporte, diálogo de duplicados, timeline y muro.
- Capturas desktop de mapas simultáneos, popup apilado, filtros y prioridad.
- Captura de la app instalada con el icono institucional.
- Registro de una notificación Web Push sin datos personales.
- Capturas de tablas, funciones, políticas y cron sin mostrar secretos ni datos reales.
- Salida de `npm run lint` y `npm run build`.

## Configuración manual antes de aceptación

1. Configurar Site URL y Redirect URLs de local/producción en Auth.
2. Generar VAPID; guardar pública en `VITE_VAPID_PUBLIC_KEY`.
3. Guardar `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y
   `PUSH_WEBHOOK_SECRET` como secretos de Edge Functions.
4. Crear Database Webhook para `INSERT` en `public.notifications`, enviando
   `x-webhook-secret` sin escribir el secreto en el repositorio.
5. Activar protección de contraseñas filtradas en Supabase Auth.
6. Ejecutar las pruebas T-01 a T-16 con datos ficticios.

## Brechas y riesgos residuales

- La IA usa reglas y trigramas; puede producir falsos positivos en zonas densas.
- Web Push depende del navegador; en iOS requiere PWA instalada.
- El Service Worker solo se registra en producción y debe probarse por HTTPS.
- Las columnas DPI/teléfono no se endurecen a `NOT NULL` hasta completar un
  backfill seguro de perfiles históricos.
- No se fusionan ni eliminan incidencias; toda sugerencia requiere decisión humana.
