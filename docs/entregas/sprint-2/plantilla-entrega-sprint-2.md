# Plantilla de entrega Sprint 2

## Alcance evaluado

Sprint 2 corresponde a **Ambiente configurado y prueba de concepto**. El objetivo del backlog es tener el entorno operativo, Supabase configurado, políticas RLS aplicadas, CI/CD inicial y una prueba de concepto de Google Auth en el cliente.

No se modifica `PlantillaEntrega.xlsx`. Esta matriz contiene valores sugeridos para copiar en las celdas amarillas de `REPORTE`, `FUNCIONES` y `PRUEBAS`.

## REPORTE

| Celda sugerida | Campo | Valor para copiar |
| --- | --- | --- |
| B6 | Código del proyecto | PWA-ALCALDIA-Z18 |
| B7 | Nombre del proyecto | Sistema de Gestión de Incidencias - Alcaldía Auxiliar Zona 18 |
| B8 | Responsable | Marvin Lázaro / Equipo PG2 |
| B9 | Tipo de solución | Aplicacion movil/PWA |
| B10 | Tecnologías principales | React 19, Vite 8, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase Auth/Database/Storage, GitHub Actions, Vercel |
| B11 | Metodología | Agile/Scrum con backlog gestionado en Jira |
| B12 | Versión actual | Sprint 2 - v0.2.0 ambiente y prueba de concepto |
| B13 | Hito actual | Prueba de concepto |
| B14 | Última actualización | 2026-08-18 |
| E6 | MVP y planificación % | 100 |
| E7 | Base técnica % | 90 |
| E9 | Integración % | 75 |
| E11 | Despliegue % | 60 |
| E12 | Evidencias y respaldos % | 85 |
| B17 | Flujo principal funciona | Sí |
| B18 | Versión ejecutable | Sí |
| B19 | Dependencias confirmadas | Sí |
| B20 | Dependencia bloqueada | Sí |
| B21 | Defectos críticos | 0 |
| B22 | Defectos altos | 1 |
| B23 | Atraso (días) | 0 |
| E17 | Próximo entregable | Sprint 3: primer incremento funcional del módulo ciudadano PWA |
| E18 | Fecha compromiso | 2026-08-22 |
| E19 | Bloqueo actual | Google Auth requiere habilitar provider y redirect URLs en Supabase Dashboard; despliegue Vercel debe validarse con GitHub Actions |
| E20 | Plan de contingencia | Mantener email/password operativo mientras se configura Google Auth; usar `.env.example` y CI local/GitHub Actions como evidencia técnica |
| E21 | Evidencia principal / URL | `docs/configuracion/google-auth-supabase.md`, `.github/workflows/ci.yml`, Supabase RLS, build/lint local, GitHub remoto |
| E22 | Resumen del avance semanal | Se configuró la base técnica con Supabase, perfiles/RLS, cliente Supabase tipado, CI inicial, POC Google Auth en cliente, documentación de configuración y control Git para evitar publicar `.env`. |

### Evidencia global recomendada

- Captura de Supabase con tablas `profiles` e `incidents`.
- Captura de políticas RLS aplicadas para ciudadano/admin/anónimo.
- Captura de `LoginForm` con botón `Continuar con Google`.
- Captura de `docs/configuracion/google-auth-supabase.md`.
- Captura del workflow `.github/workflows/ci.yml`.
- Captura de `npm run build` y `npm run lint`.
- Captura de `git status` mostrando `.env` fuera del tracking.
- Captura de Jira con `TASK-2.1` a `TASK-2.4` actualizadas.

## FUNCIONES

| ID | Módulo | Funcionalidad | Prioridad | Estado | Peso | Definición de terminado | Evidencia / URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Base de datos | Proyecto Supabase con tablas iniciales `profiles` e `incidents` | Obligatoria | Terminada y probada | 1 | Sí | Supabase Dashboard, `src/lib/supabase.types.ts` |
| F-02 | Seguridad | Políticas RLS para ciudadano, admin y lectura pública anonimizada | Obligatoria | Terminada y probada | 1 | Sí | Políticas Supabase, ADR 0005 |
| F-03 | Integración | Cliente Supabase tipado con variables de entorno | Obligatoria | Terminada y probada | 1 | Sí | `src/lib/supabaseClient.ts`, `.env.example` |
| F-04 | Autenticación | Inicio de sesión por email/password con Supabase Auth | Obligatoria | Funciona sin pruebas | 1 | No | `src/components/auth/LoginForm.tsx` |
| F-05 | Autenticación | POC Google Auth en cliente | Obligatoria | Funciona parcialmente | 1 | No | Botón `Continuar con Google`; requiere provider Supabase |
| F-06 | CI/CD | Workflow GitHub Actions para build/lint | Obligatoria | Funciona sin pruebas | 1 | No | `.github/workflows/ci.yml` |
| F-07 | Configuración | Variables seguras mediante `.env.example` y `.env` fuera del tracking | Obligatoria | Terminada y probada | 1 | Sí | `.gitignore`, `.env.example`, `git rm --cached .env` |
| F-08 | Roles | Resolución de rol desde `profiles` para enrutar ciudadano/admin | Obligatoria | Funciona sin pruebas | 1 | No | `src/App.tsx` |
| F-09 | Perfiles | Perfil ciudadano extendido con DPI, teléfono y dirección | Obligatoria | Funciona sin pruebas | 1 | No | `RegisterForm.tsx`, `ProfileSettingsView.tsx` |
| F-10 | Evidencias | Documentación de configuración Google Auth y control Git | Deseable | Terminada y probada | 1 | Sí | `docs/configuracion/google-auth-supabase.md`, `docs/git-control-versiones.md` |
| F-11 | Arquitectura | ADRs para decisiones significativas de Supabase/RLS/UI/mapas | Deseable | Terminada y probada | 1 | Sí | `docs/adr/` |
| F-12 | Verificación | Build y lint local como controles de calidad del entorno | Obligatoria | Terminada y probada | 1 | Sí | Salida de consola `npm run build` y `npm run lint` |

### Evidencia por función

- `F-01` a `F-02`: capturas de Supabase con estructura de tablas y policies.
- `F-03` y `F-07`: captura de `.env.example`, `.gitignore` y cliente Supabase.
- `F-04` a `F-05`: captura del login y documentación Google Auth.
- `F-06`: captura del archivo CI y, cuando se haga push, ejecución de GitHub Actions.
- `F-08` a `F-09`: capturas de acceso por rol y perfil extendido.
- `F-10` a `F-11`: capturas de documentación y ADRs.
- `F-12`: capturas de consola con lint/build aprobados.

## PRUEBAS

| ID | ID función | Tipo de prueba | Descripción | Resultado esperado | Estado | Severidad | Evidencia / URL | Fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | F-01 | Integración | Verificar tablas iniciales en Supabase | `profiles` e `incidents` existen con columnas requeridas | Aprobada | N/A | Supabase Dashboard / tipos locales | 2026-08-18 |
| T-02 | F-02 | Validación | Verificar reglas RLS por rol | Ciudadano lee propios datos; admin gestiona; anónimo solo ve públicos resueltos | Aprobada | Alta | Policies Supabase / ADR 0005 | 2026-08-18 |
| T-03 | F-03 | Integración | Validar variables Supabase en cliente | La app carga cliente con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` | Aprobada | N/A | `supabaseClient.ts`, `.env.example` | 2026-08-18 |
| T-04 | F-04 | Funcional | Login email/password | Usuario autenticado accede según su rol | No ejecutada | Alta | Prueba manual pendiente | 2026-08-18 |
| T-05 | F-05 | Integración | POC Google Auth | Botón redirige a Google cuando el provider esté configurado | Bloqueada | Alta | Requiere Supabase Dashboard | 2026-08-18 |
| T-06 | F-06 | Regresión | Ejecutar CI local equivalente | `npm run build` y `npm run lint` finalizan sin errores | Aprobada | N/A | Consola local / futuro GitHub Actions | 2026-08-18 |
| T-07 | F-07 | Validación | Confirmar `.env` fuera del tracking | `.env` queda ignorado y no se publica; `.env.example` queda versionable | Aprobada | Crítica | `git status`, `.gitignore` | 2026-08-18 |
| T-08 | F-08 | Funcional | Enrutamiento por rol | Admin entra al dashboard; ciudadano entra al módulo PWA | No ejecutada | Alta | Prueba manual pendiente | 2026-08-18 |
| T-09 | F-10 | Usuario | Revisar documentación de configuración | Documento permite configurar Google Auth sin exponer secretos | Aprobada | Baja | `docs/configuracion/google-auth-supabase.md` | 2026-08-18 |
| T-10 | F-12 | Regresión | Build de producción | `npm run build` genera `dist` sin errores | Aprobada | N/A | Salida de consola build | 2026-08-18 |

### Evidencia por prueba

- Para `T-01` a `T-02`: capturas Supabase ocultando datos sensibles.
- Para `T-04` y `T-08`: video corto o capturas del login y redirección por rol.
- Para `T-05`: captura de configuración Google Provider cuando se habilite.
- Para `T-06` y `T-10`: salida de consola o GitHub Actions.
- Para `T-07`: captura de `git status` y `.gitignore`.

## Recomendación para Jira

Actualizar Sprint 2 con estas evidencias:

- `TASK-2.1`: captura Supabase tablas iniciales.
- `TASK-2.2`: captura RLS + ADR 0005.
- `TASK-2.3`: captura `.github/workflows/ci.yml` y futura ejecución GitHub Actions.
- `TASK-2.4`: captura botón Google Auth + guía de configuración Supabase.
