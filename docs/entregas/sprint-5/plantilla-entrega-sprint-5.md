# Plantilla de entrega Sprint 5

## Alcance evaluado

Sprint 5 corresponde a **pulido, notificaciones persistidas y correcciones**. El objetivo es cerrar contraste, bandeja con nombre, retroceso Kanban, campana real, perfil admin reducido, recuperación de contraseña, mapa bajo diálogos, etiquetas 509/511 y el nombre **PWA Alcaldia**.

No se rehacen el muro, los roles ni la publicación ya entregados en Sprint 4. No se modifica `PlantillaEntrega.xlsx`. Esta matriz contiene valores sugeridos para copiar en las celdas amarillas de `REPORTE`, `FUNCIONES` y `PRUEBAS`.

## REPORTE

| Celda sugerida | Campo | Valor para copiar |
| --- | --- | --- |
| B6 | Código del proyecto | PWA-ALCALDIA-Z18 |
| B7 | Nombre del proyecto | Sistema de Gestión de Incidencias - Alcaldía Auxiliar Zona 18 |
| B8 | Responsable | Marvin Lázaro / Equipo PG2 |
| B9 | Tipo de solución | Aplicacion movil/PWA |
| B10 | Tecnologías principales | React 19, Vite 8, TypeScript, Tailwind CSS 4, shadcn/ui, Leaflet/OpenStreetMap, Supabase Auth/Database/Storage, Service Worker, GitHub Actions, Vercel |
| B11 | Metodología | Agile/Scrum con backlog gestionado en Jira |
| B12 | Versión actual | Sprint 5 - v0.5.0 pulido, notificaciones y recuperación de contraseña |
| B13 | Hito actual | Incremento funcional |
| B14 | Última actualización | 2026-09-07 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 95 |
| E9 | Integración % | 92 |
| E11 | Despliegue % | 90 |
| E12 | Evidencias y respaldos % | 90 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | No |
| B21 | Defectos críticos | 0 |
| B22 | Defectos altos | 0 |
| B23 | Atraso (días) | 0 |
| E17 | Próximo entregable | Cierre académico / pruebas de aceptación residuales |
| E18 | Fecha compromiso | 2026-09-21 |
| E19 | Bloqueo actual | La migración remota de `notifications` y el CHECK 509/511 esperan autorización explícita; las Redirect URLs de Auth se configuran en el Dashboard |
| E20 | Plan de contingencia | Archivo SQL versionado listo para aplicar; recuperación de contraseña documentada con Site URL + Additional Redirect URLs |
| E21 | Evidencia principal / URL | `NotificationsMenu.tsx`, `ResetPasswordForm.tsx`, `202609071945_add_notifications_and_call_type_label_fix.sql`, `npm run lint` / `npm run build` |
| E22 | Resumen del avance semanal | Se corrigió el contraste de títulos, el mapa ya no tapa diálogos, la bandeja muestra nombre, el Kanban retrocede, la campana lee avisos persistidos y el login usa el nombre PWA Alcaldia. |

### Evidencia global recomendada

- Captura de Jira con Sprint 5.
- Captura modo claro (SO oscuro) de Bandeja, Resueltos y un popup de detalle.
- Captura de Bandeja con `Nombre Apellido` y de headers sin botón Nueva.
- Captura del Kanban avanzando y retrocediendo (incluido salir de Resuelto).
- Captura de la campana admin (abre Bandeja) y ciudadana (Mis tickets / Muro).
- Captura del perfil admin sin DPI, teléfono, dirección ni eliminación.
- Captura de Seguridad de la cuenta con el mensaje del enlace de contraseña.
- Captura del formulario de nueva contraseña (si el redirect de Auth ya está configurado).
- Captura del catálogo 509/511 sin `(REGENCIA NORTE)`.
- Captura de login: Bienvenido oscuro, inputs claros, sin recuadro admin, nombre PWA Alcaldia.
- Captura de `npm run lint` / `npm run build` sin errores.

## FUNCIONES

| ID | Módulo | Funcionalidad | Prioridad | Estado | Peso | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | UI global | Contraste de títulos y popups según tema de la app | Obligatoria | Terminada y probada | 1 | Sí | `src/index.css`, `dialog.tsx` |
| F-02 | Administrativo | Bandeja muestra nombre del ciudadano | Obligatoria | Terminada y probada | 1 | Sí | `AdminInboxView.tsx` |
| F-03 | Administrativo | Headers sin alta de incidencia | Obligatoria | Terminada y probada | 1 | Sí | `AdminTicketTable.tsx`, `AdminTicketsBoardView.tsx` |
| F-04 | Administrativo | Retroceso de estado en Kanban | Obligatoria | Terminada y probada | 1 | Sí | `handleMoveBackward` y popup de detalle |
| F-05 | Notificaciones | Tabla, RLS, triggers y menú de campana | Obligatoria | Funciona sin pruebas remotas | 1 | No | Migración local; aplicar en remoto pendiente |
| F-06 | Perfil | Perfil admin reducido y mensaje de reset en Seguridad | Obligatoria | Terminada y probada | 1 | Sí | `ProfileSettingsView.tsx` |
| F-07 | Auth | Recuperación de contraseña con `PASSWORD_RECOVERY` | Obligatoria | Funciona sin pruebas | 1 | No | `ResetPasswordForm.tsx`; requiere Redirect URLs |
| F-08 | Ciudadano | Timeline de 3 estados e icono Sol/Luna | Deseable | Terminada y probada | 1 | Sí | `MyCasesView.tsx`, `CitizenLayout.tsx` |
| F-09 | Mapa / catálogo | Leaflet bajo diálogos y labels 509/511 | Obligatoria | Terminada y probada | 1 | Sí | `index.css`, `incident-classification.ts` |
| F-10 | Auth / PWA | Nombre PWA Alcaldia y login claro | Obligatoria | Terminada y probada | 1 | Sí | `App.tsx`, `index.html`, `manifest.webmanifest` |

### Evidencia por función

- `F-01`, `F-08`, `F-10`: capturas de modo claro y del chrome ciudadano.
- `F-02` a `F-04`, `F-06`: capturas desktop del dashboard.
- `F-05`: captura de la campana y, cuando se aplique la migración, de la tabla en Supabase.
- `F-07`: captura del correo o del formulario de nueva contraseña.
- `F-09`: captura de un diálogo sobre el mapa y del dropdown 509/511.

## PRUEBAS

| ID | ID función | Tipo de prueba | Descripción | Resultado esperado | Estado | Severidad | Evidencia / URL | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Usuario | SO oscuro + tema claro | Títulos y `DialogTitle` quedan oscuros y legibles | Aprobada | Alta | `src/index.css` | 2026-09-07 |
| T-02 | F-02 | Funcional | Abrir Bandeja | Se ve nombre y apellido o "Sin nombre" | Aprobada | Alta | `AdminInboxView.tsx` | 2026-09-07 |
| T-03 | F-03 | Usuario | Headers Incidencias y Tablero | No hay "Nueva incidencia" ni "+ Nueva" | Aprobada | Media | Headers admin | 2026-09-07 |
| T-04 | F-04 | Funcional | Retroceder desde Resuelto | Vuelve a En proceso y se despublica | Aprobada | Alta | `AdminTicketsBoardView.tsx` | 2026-09-07 |
| T-05 | F-05 | Integración | Campana admin y ciudadana | Click abre Bandeja / Mis tickets / Muro; el muro no expone identidad | No ejecutada | Alta | Requiere migración remota | 2026-09-07 |
| T-06 | F-06 | Usuario | Perfil admin | Sin DPI, teléfono, dirección ni eliminación | Aprobada | Media | `ProfileSettingsView.tsx` | 2026-09-07 |
| T-07 | F-07 | Integración | Enlace de recuperación | `PASSWORD_RECOVERY` muestra el formulario de nueva contraseña | No ejecutada | Alta | Redirect URLs en Dashboard | 2026-09-07 |
| T-08 | F-08 | Usuario | Timeline Mis tickets | Solo Recibido / En proceso / Resuelto | Aprobada | Media | `MyCasesView.tsx` | 2026-09-07 |
| T-09 | F-09 | Usuario | Mapa + catálogo | El mapa no tapa el diálogo; 509/511 sin sufijo | Aprobada | Media | Leaflet z-index 0 | 2026-09-07 |
| T-10 | F-10 | Integración | Lint y build | `npm run lint` y `npm run build` finalizan sin errores | Aprobada | Media | Consola local / CI | 2026-09-07 |

### Evidencia por prueba

- Para `T-01` a `T-04`, `T-06`, `T-08` y `T-09`: capturas con datos ficticios.
- Para `T-05` y `T-07`: pendientes de migración remota y de Redirect URLs.
- Para `T-10`: salida de lint y build.
- No adjuntar `.env`, tokens ni filas con datos reales de ciudadanos.

## Recomendación para Jira

Actualizar Sprint 5 con estas evidencias:

- Contraste y nombre PWA Alcaldia.
- Bandeja con nombre y Kanban con retroceso.
- Campana (cuando la migración remota esté aplicada).
- Recuperación de contraseña (cuando las Redirect URLs estén configuradas).
- Adjuntar enlace del pull request y del despliegue Vercel.

## Brechas conocidas

- La migración `202609071945_add_notifications_and_call_type_label_fix.sql` está en el repositorio y **no se aplica en el proyecto Supabase compartido hasta autorización explícita**.
- En Authentication → URL Configuration hay que fijar Site URL al origen de Vercel y Additional Redirect URLs a `http://localhost:5173` más la URL de producción.
- Al retroceder desde Resuelto se limpian resumen y foto de resolución en la fila; el objeto en Storage puede quedar huérfano.
- La expiración automática de 30 días del muro sigue fuera de alcance.
- Detección de duplicados e IA permanecen en fase futura.
