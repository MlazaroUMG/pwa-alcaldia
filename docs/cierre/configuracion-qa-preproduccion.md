# Configuración QA de preproducción

## Variables de entorno

Frontend (Vercel y `.env` local):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_VAPID_PUBLIC_KEY`

Edge Functions (secretos de Supabase, no `VITE_`):

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `PUSH_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEYS`

## Storage

El bucket `incident-photos` debe quedar privado, con límite de 5 MB y MIME
`image/jpeg`, `image/png`, `image/webp`. Las fotografías se suben solo por la
Edge Function `upload-incident-photo`.

## Auth

- Confirmación de correo activa.
- Política de contraseña 12–64 caracteres (límite práctico 72 bytes UTF-8).
- El perfil ciudadano se crea con el trigger `on_auth_user_created`.

## Migración y funciones

Aplicado el 2026-09-17 sobre el proyecto remoto `cgpwabpfadbtbohxowxz`:

1. Migración `qa_preproduccion` (folio, descarte, Storage privado, auditoría).
2. Migración `qa_revoke_protect_profile_rpc` (el trigger de identidad no es RPC).
3. Edge Functions `upload-incident-photo` y `anonymize-account` (`verify_jwt: true`).

`send-push` se mantiene con `verify_jwt: false` porque se autentica con
`PUSH_WEBHOOK_SECRET`.

## Reversión

No borrar historial de descarte ni fotografías. Se pueden revocar las RPC y
dejar de usar las columnas nuevas. Volver el bucket a público solo como
contingencia controlada.
