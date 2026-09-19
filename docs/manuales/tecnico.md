# Manual técnico

Para quien mantenga el repositorio. Corte 2026-09-18.

## 1. Arquitectura

- Frontend: React 19, TypeScript 6, Vite 8, Tailwind 4, shadcn/ui.
- Mapas: Leaflet + OpenStreetMap (ADR 0002). Sin API key de pago.
- Navegación: estado local en `CitizenLayout` y `AdminLayout` (ADR 0003).
  No hay React Router.
- Backend: Supabase (Auth, PostgreSQL, Storage, Edge Functions Deno).
- Autorización: RLS y `private.is_admin()`. El rol no se toma de
  `user_metadata`.
- Despliegue previsto: Vercel + GitHub Actions.

## 2. Modelo de datos (contratos)

Tablas principales: `profiles`, `incidents`, `incident_audit_events`,
`notifications`, `account_anonymization_requests`.

Incidencia: folio `ticket_number`, estados Pendiente / En Progreso /
Resuelto, `discarded_at`, `image_path` + `image_url` firmada,
`resolution_image_path` + `resolution_image_url`, `is_public`,
`resolution_summary`, coordenadas.

Perfil: `role` (`citizen` \| `admin`), nombre, DPI (único e inmutable una
vez fijado), teléfono, dirección opcional, consentimiento.

Tipos: `src/lib/supabase.types.ts`. Actualizarlos si cambia el esquema.

## 3. RLS (resumen)

- Ciudadano: su perfil, sus incidencias, muro vía `get_community_board`.
- Admin: lectura de incidencias y perfiles; único rol que cambia estado.
- Anónimo: no lee fotos privadas ni perfiles.
- Auditoría: SELECT e INSERT solo admin (`Admins can insert incident audit`
  aplicada el 2026-09-18).
- Descarte: RPC `discard_incidents` / `restore_incidents` (SECURITY DEFINER).

Cualquier cambio de política es riesgo alto (AGENTS.md 6.4).

## 4. Storage

Bucket `incident-photos`, privado, 5 MB, MIME jpeg/png/webp. Subida solo
por `upload-incident-photo` (`verify_jwt: true`). El cliente muestra
`SignedPhoto`. El muro puede leer la foto de resolución publicada.

## 5. Edge Functions

| Función | JWT | Uso |
| --- | --- | --- |
| `upload-incident-photo` | true | Evidencia o resolución; escribe path + URL firmada |
| `anonymize-account` | true | Retiro de cuenta ciudadana |
| `send-push` | false | Webhook con `PUSH_WEBHOOK_SECRET` |

Runtime: Deno, no Node.

## 6. Variables

Ver `docs/cierre/configuracion-qa-preproduccion.md`. Nunca commitear `.env`.

## 7. Instalación local

```bash
npm ci
# crear .env a partir de .env.example
npm run dev
npm test
npm run lint
npm run build
```

`npm run test:e2e` requiere Playwright y Chromium.

## 8. CI/CD

`.github/workflows/ci.yml`: `npm ci`, `npm test`, `npm run build`,
`npm run lint`. Playwright no corre en CI para no instalar navegadores.

`vercel.json` solo declara cabeceras. El deploy a Vercel no forma parte de
este corte.

## 9. ADR vigentes

0001 Supabase/RLS; 0002 Leaflet; 0003 sidebar sin router; 0004 TanStack
Table; 0005 perfiles; 0006 tokens UI; 0007 heurística consultiva; 0008
descarte y validación.

## 10. Geocerca

`src/lib/geo/pinares-del-norte.ts`. Cliente + Zod. No hay CHECK SQL. El
polígono es operativo.
