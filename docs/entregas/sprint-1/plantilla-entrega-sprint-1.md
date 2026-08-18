# Plantilla de entrega Sprint 1

## Alcance evaluado

Sprint 1 corresponde a **Diagnóstico técnico, definición de MVP y planificación**. La evaluación se basa en el backlog del proyecto, el estado actual del repositorio y la plantilla `PlantillaEntrega.xlsx`.

No se modifica el Excel original. Esta matriz contiene los valores sugeridos para copiar en las celdas amarillas de las hojas `REPORTE`, `FUNCIONES` y `PRUEBAS`.

## REPORTE

| Celda sugerida | Campo | Valor para copiar |
| --- | --- | --- |
| B6 | Código del proyecto | PWA-ALCALDIA-Z18 |
| B7 | Nombre del proyecto | Sistema de Gestión de Incidencias - Alcaldía Auxiliar Zona 18 |
| B8 | Responsable | Marvin Lázaro / Equipo PG2 |
| B9 | Tipo de solución | Aplicacion movil/PWA |
| B10 | Tecnologías principales | React 19, Vite 8, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase Auth/Database/Storage, GitHub, Vercel |
| B11 | Metodología | Agile/Scrum con backlog gestionado en Jira |
| B12 | Versión actual | Sprint 1 - v0.1.0 diagnóstico y MVP definido |
| B13 | Hito actual | Diagnóstico técnico |
| B14 | Última actualización | 2026-08-14 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 80 |
| E9 | Integración % | 60 |
| E11 | Despliegue % | 40 |
| E12 | Evidencias y respaldos % | 70 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | No |
| B21 | Defectos críticos | 0 |
| B22 | Defectos altos | 2 |
| B23 | Atraso (días) | 0 |
| E17 | Próximo entregable | Sprint 2: ambiente configurado y prueba de concepto de autenticación |
| E18 | Fecha compromiso | 2026-08-08 |
| E19 | Bloqueo actual | Configuración externa de Google Auth en Supabase y deuda de lint en componentes shadcn |
| E20 | Plan de contingencia | Mantener email/password mientras se habilita Google Provider; documentar configuración Supabase; corregir deuda de lint antes de exigir CI verde |
| E21 | Evidencia principal / URL | Capturas Jira Sprint 1, repositorio GitHub, build local, Supabase proyecto `cgpwabpfadbtbohxowxz`, ADRs en `docs/adr/` |
| E22 | Resumen del avance semanal | Se delimitó el MVP, se definió el stack React/Vite/Supabase, se documentó gobernanza técnica, se registraron ADRs y se inició la base funcional del sistema con autenticación, perfiles, RLS y módulos ciudadano/admin. |

### Evidencia global recomendada

- Captura del tablero Jira con Sprint 1 cerrado y tareas `TASK-1.1` a `TASK-1.4`.
- Captura del backlog priorizado en Jira/Rovo.
- Captura del repositorio GitHub con rama, commits y estado de PR si aplica.
- Captura de `npm run build` ejecutado localmente.
- Captura de Supabase con tablas `profiles` e `incidents`, ocultando datos sensibles.
- Captura de `docs/adr/` mostrando decisiones arquitectónicas registradas.
- Captura de `.github/workflows/ci.yml` como evidencia de preparación CI/CD.

## FUNCIONES

| ID | Módulo | Funcionalidad | Prioridad | Estado | Peso | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Ciudadano | Flujo ciudadano MVP para registrar una incidencia | Obligatoria | Terminada y probada | 1 | Sí | Backlog Sprint 1, `cursor_plan_incidencias.md`, criterios de aceptación del flujo ciudadano |
| F-02 | Administrativo | Flujo administrativo MVP para gestionar y resolver tickets | Obligatoria | Terminada y probada | 1 | Sí | Backlog Sprint 1, `cursor_plan_incidencias.md`, ADRs de dashboard/RLS |
| F-03 | Autenticación | Login email/password y POC Google Auth | Obligatoria | Funciona parcialmente | 1 | No | `LoginForm.tsx`; falta habilitar provider Google en Supabase Dashboard |
| F-04 | Seguridad | Perfiles por rol ciudadano/admin y RLS | Obligatoria | Funciona sin pruebas | 1 | No | `src/lib/supabase.types.ts`, políticas RLS Supabase, ADR 0005 |
| F-05 | Ciudadano | Registro con DPI, teléfono y dirección opcional | Obligatoria | Funciona sin pruebas | 1 | No | `RegisterForm.tsx`, `register-form.schema.ts` |
| F-06 | Ciudadano | Formulario de reporte de incidencia | Obligatoria | Funciona sin pruebas | 1 | No | `IncidentSubmissionForm.tsx` |
| F-07 | Ciudadano | Carga de fotografía a Supabase Storage | Obligatoria | Funciona sin pruebas | 1 | No | Bucket `incident-photos`, inserción `image_url` |
| F-08 | Ciudadano | Geolocalización obligatoria con mapa interactivo | Obligatoria | Funciona sin pruebas | 1 | No | `LocationPicker.tsx`, `latitude`, `longitude` |
| F-09 | Ciudadano | Seguimiento de casos propios | Deseable | Funciona sin pruebas | 1 | No | `MyCasesView.tsx`, `LocationPreviewMap.tsx` |
| F-10 | Administrativo | Dashboard admin con sidebar, búsqueda y modo oscuro | Obligatoria | Funciona parcialmente | 1 | No | `AdminLayout.tsx`, `ThemeProvider.tsx`, `ThemeToggle.tsx` |
| F-11 | Administrativo | Gestión de tickets y cambio de estado | Obligatoria | Funciona sin pruebas | 1 | No | `AdminTicketTable.tsx`, `ResolveIncidentDialog.tsx` |
| F-12 | Comunidad | Community Board anonimizado para incidencias resueltas | Deseable | Funciona parcialmente | 1 | No | `CommunityBoard.tsx`, `AdminCommunityWallView.tsx`; falta expiración automática 30 días |

### Evidencia por función

- `F-01` a `F-02`: captura del backlog Sprint 1, flujo MVP ciudadano/admin y criterios de aceptación documentados.
- `F-03`: captura del formulario con botón `Continuar con Google` y guía `docs/configuracion/google-auth-supabase.md`.
- `F-04`: captura de políticas RLS en Supabase y ADR 0005.
- `F-05` a `F-09`: capturas mobile del registro, formulario, mapa y vista `Mis casos`.
- `F-10` a `F-11`: capturas desktop del dashboard, sidebar colapsado y tabla de gestión.
- `F-12`: captura del muro público y control administrativo de publicación.

## PRUEBAS

| ID | ID función | Tipo de prueba | Descripción | Resultado esperado | Estado | Severidad | Evidencia / URL | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Validación | Validar flujo ciudadano MVP | El flujo incluye registro, reporte con categoría/foto/ubicación y seguimiento de caso | Aprobada | N/A | Backlog Sprint 1 y criterios de aceptación documentados | 2026-08-14 |
| T-02 | F-02 | Validación | Validar flujo administrativo MVP | El flujo incluye bandeja, gestión de estado, resolución y publicación controlada | Aprobada | N/A | Backlog Sprint 1, ADRs y criterios de aceptación documentados | 2026-08-14 |
| T-03 | F-03 | Funcional | Login por email/password | Usuario autenticado entra a módulo según rol | No ejecutada | Alta | Prueba manual pendiente | 2026-08-14 |
| T-04 | F-03 | Integración | POC Google Auth | Botón redirige a Google si provider está habilitado | Bloqueada | Alta | Requiere configuración Supabase Dashboard | 2026-08-14 |
| T-05 | F-05 | Validación | Registro ciudadano con DPI/teléfono | Perfil ciudadano guarda datos obligatorios | No ejecutada | Alta | Prueba manual pendiente | 2026-08-14 |
| T-06 | F-08 | Errores | Reporte sin coordenadas | El formulario bloquea el envío sin ubicación | No ejecutada | Alta | Prueba manual mobile pendiente | 2026-08-14 |
| T-07 | F-06 | Integración | Crear incidencia con foto y ubicación | Supabase guarda fila, `image_url`, latitud y longitud | No ejecutada | Alta | Prueba manual pendiente | 2026-08-14 |
| T-08 | F-11 | Funcional | Cambio de estado por admin | Admin actualiza estado y abre modal al resolver | No ejecutada | Alta | Prueba manual pendiente | 2026-08-14 |
| T-09 | F-12 | Validación | Publicación en Community Board | Solo se muestran categoría, resumen, imagen y fecha | No ejecutada | Media | Prueba manual/RLS pendiente | 2026-08-14 |
| T-10 | F-10 | Usuario | Responsividad admin fullscreen | Las vistas ocupan el ancho disponible sin overflow general | No ejecutada | Media | Prueba visual pendiente | 2026-08-14 |

### Evidencia por prueba

- Para pruebas aprobadas: captura de consola o GitHub Actions.
- Para pruebas manuales: captura antes/después y datos de prueba anonimizados.
- Para pruebas RLS: captura de policies Supabase y resultado esperado por rol.
- Para pruebas móviles: captura del viewport o dispositivo físico con fecha.
- Para pruebas Jira: vincular cada prueba a la historia/tarea del sprint.

## Recomendación para documentar flujo Jira

1. Capturar el backlog con épicas `EPIC-1` a `EPIC-5`.
2. Capturar Sprint 1 con tareas `TASK-1.1` a `TASK-1.4`.
3. Capturar Sprint 2 con `TASK-2.1` a `TASK-2.4`.
4. Mostrar el avance por columnas: `Por hacer`, `En progreso`, `En revisión`, `Hecho`.
5. Adjuntar enlace o captura de commits/PR relacionados a cada tarea.
6. Para cada entrega, guardar una carpeta:

```text
docs/entregas/sprint-<n>/
```

7. Incluir en cada carpeta: matriz de plantilla, capturas, checklist de pruebas y resumen de brechas.
