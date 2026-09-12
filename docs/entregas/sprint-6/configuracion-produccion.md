# Configuración final de producción

Las migraciones remotas y `send-push` versión 1 ya están desplegadas en el
proyecto `cgpwabpfadbtbohxowxz`. Los siguientes pasos requieren acceso manual
al Dashboard porque las herramientas remotas disponibles no administran
secretos, variables de Vercel ni configuración de Auth.

## 1. Generar VAPID y secreto del webhook

Ejecutar una sola vez fuera de Git:

```powershell
npx web-push generate-vapid-keys --json

$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Guardar:

- `publicKey` como clave VAPID pública.
- `privateKey` como clave VAPID privada.
- La salida Base64 de PowerShell como `PUSH_WEBHOOK_SECRET`.

No guardar estos valores en archivos versionados, capturas o Jira.

## 2. Configurar secretos de Supabase

1. Abrir Supabase Dashboard → proyecto → **Edge Functions → Secrets**.
2. Crear:
   - `VAPID_PUBLIC_KEY`: valor `publicKey`.
   - `VAPID_PRIVATE_KEY`: valor `privateKey`.
   - `PUSH_WEBHOOK_SECRET`: salida Base64.
3. Guardar. `SUPABASE_URL` y las claves internas ya son provistas por
   Supabase; no duplicarlas en el frontend.

## 3. Crear el Database Webhook

1. Ir a **Database → Webhooks → Create a new hook**.
2. Nombre: `notifications-send-push`.
3. Tabla: esquema `public`, tabla `notifications`.
4. Evento: únicamente `INSERT`.
5. Tipo: HTTP Request.
6. Método: `POST`.
7. URL:
   `https://cgpwabpfadbtbohxowxz.supabase.co/functions/v1/send-push`
8. Headers:
   - `Content-Type`: `application/json`
   - `x-webhook-secret`: mismo valor de `PUSH_WEBHOOK_SECRET`
9. Guardar y dejar habilitado.

No agregar `Authorization` con la VAPID privada. La función valida el header
secreto propio y está desplegada con `verify_jwt = false` por ser un webhook.

## 4. Configurar Vercel

1. Abrir Vercel → proyecto → **Settings → Environment Variables**.
2. Crear `VITE_VAPID_PUBLIC_KEY` con la clave VAPID pública.
3. Seleccionar Production y Preview; Development solo si se usa un entorno
   HTTPS local compatible con Service Worker.
4. Confirmar que también existen `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Guardar y ejecutar un nuevo deployment; Vite incorpora variables en build.

## 5. Configurar Auth y Google

1. Supabase → **Authentication → URL Configuration**.
2. `Site URL`: origen HTTPS final de Vercel, sin ruta.
3. `Redirect URLs`:
   - `http://localhost:5173/**`
   - `https://<dominio-produccion>/**`
   - URLs Preview necesarias, o el patrón controlado recomendado por Vercel.
4. En Google Cloud Console, conservar como redirect URI autorizado:
   `https://cgpwabpfadbtbohxowxz.supabase.co/auth/v1/callback`.
5. Supabase → Authentication → configuración de Email/Password:
   activar **Leaked Password Protection**.

## 6. Prueba de Web Push

1. Abrir el deployment HTTPS en Chrome Android.
2. Instalar la PWA y volver a abrirla desde el icono.
3. Iniciar sesión con un ciudadano de prueba y completar DPI/teléfono.
4. Abrir la campana y pulsar **Activar notificaciones del dispositivo**.
5. Aceptar el permiso del sistema.
6. Confirmar en Table Editor que existe una fila propia en
   `push_subscriptions`.
7. Con una cuenta admin de prueba, cambiar el estado de esa incidencia.
8. Verificar:
   - nueva fila en `notifications`;
   - ejecución exitosa en **Edge Functions → send-push → Logs**;
   - notificación visible en la bandeja del teléfono;
   - al tocarla se abre la PWA.

Si el permiso se rechaza, la campana in-app debe continuar funcionando. En
iOS, Web Push requiere agregar primero la PWA a la pantalla de inicio.

## 7. Pruebas de seguridad

- Un ciudadano incompleto debe ver el formulario de completar perfil y no
  poder insertar incidencias hasta registrar DPI y teléfono válidos.
- Un ciudadano no debe poder cambiar `role`, `id` o `created_at`.
- Un INSERT ciudadano debe ser propio, `Pendiente`, no público y sin datos de
  resolución.
- `anon` no debe poder leer `incidents` ni ejecutar las RPC del muro/IA.
- El muro autenticado solo debe recibir categoría, resumen, foto de resolución,
  fecha de resolución y fecha de publicación.
