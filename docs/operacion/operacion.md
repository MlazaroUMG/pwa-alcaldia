# Manual de operación

Corte 2026-09-18. Production Vercel aún no ejecutada.

## 1. Despliegue (cuando se autorice)

1. Confirmar CI verde en GitHub.
2. Variables `VITE_*` en Vercel (Production y Preview).
3. Deploy Preview. Smoke: login admin y ciudadano, un reporte de ensayo,
   una transición, el muro.
4. Promover a Production.
5. Site URL y Redirect URLs de Auth apuntando al dominio HTTPS.
6. VAPID y webhook según `docs/entregas/sprint-6/configuracion-produccion.md`.

Rollback de código: redeploy del deployment anterior en Vercel. Rollback de
datos: no usar Git; ver `recuperacion.md`.

## 2. Monitoreo

- Vercel: build, runtime, 5xx.
- Supabase: Auth, API, Storage, Edge Functions logs.
- Tabla `notifications` y campana: si Push falla, el in-app debe seguir.
- Advisors de seguridad de Supabase antes de cada migración nueva.

## 3. Logs

No copiar JWT, service role, DPI ni URLs firmadas a tickets o a la tesis.
Filtrar por `request_id` o folio.

## 4. Rotación de secretos

Rotar `PUSH_WEBHOOK_SECRET` y VAPID juntos: nuevo valor en Edge Secrets,
mismo valor en el webhook y en `VITE_VAPID_PUBLIC_KEY`. Invalidar
suscripciones push antiguas si cambia VAPID.

La publishable key de Supabase no es un secreto de servidor, pero no se
publica en capturas innecesarias.

## 5. Respuesta a incidentes

| Evento | Acción |
| --- | --- |
| Fuga de fotos | Confirmar bucket privado; rotar URLs firmadas; revisar policies |
| Escalada de privilegios | Verificar que el rol no se lea de `user_metadata`; revisar `handle_new_user` |
| Caída de Vercel | Rollback de deployment; la base sigue en Supabase |
| Caída de Auth | Comunicar canal WhatsApp de contingencia; no crear usuarios a mano en producción sin bitácora |
| Publicación indebida en el muro | Despublicar; no borrar el ticket |

## 6. Ventana de cambio

Migraciones remotas: respaldo, comunicado interno, aplicar, smoke, anotar
en `registro-version.md`.
