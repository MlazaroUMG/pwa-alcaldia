# Configuración de Google Auth en Supabase

## Objetivo

Habilitar la prueba de concepto de inicio de sesión con Google incluida en Sprint 2, manteniendo el acceso por correo y contraseña como respaldo.

## Prerrequisitos

- Acceso al proyecto Supabase `cgpwabpfadbtbohxowxz`.
- Acceso a Google Cloud Console para crear credenciales OAuth.
- URL local de desarrollo: `http://localhost:5173`.
- URL de despliegue en Vercel cuando exista.

## Pasos en Google Cloud Console

1. Crear o seleccionar un proyecto en Google Cloud Console.
2. Ir a `APIs & Services` > `OAuth consent screen`.
3. Configurar nombre de aplicación, correo de soporte y dominio autorizado si aplica.
4. Ir a `Credentials` > `Create credentials` > `OAuth client ID`.
5. Seleccionar tipo `Web application`.
6. Agregar como `Authorized redirect URI` la URL que Supabase muestra para Google en Auth Providers. Suele tener esta forma:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

7. Copiar `Client ID` y `Client Secret`.

## Pasos en Supabase Dashboard

1. Entrar a `Authentication` > `Providers`.
2. Activar `Google`.
3. Pegar `Client ID` y `Client Secret`.
4. Guardar cambios.
5. Entrar a `Authentication` > `URL Configuration`.
6. Verificar `Site URL`:

```text
http://localhost:5173
```

7. Agregar en `Redirect URLs`:

```text
http://localhost:5173
https://<dominio-vercel>
```

## Validación

1. Ejecutar la app local con `npm run dev`.
2. Abrir la pantalla de inicio de sesión.
3. Usar `Continuar con Google`.
4. Confirmar que Supabase crea la sesión y que la app obtiene el rol desde `profiles`.

## Limitación conocida

El flujo de Google Auth autentica al usuario, pero el proyecto aún requiere que exista una fila en `profiles` con rol `citizen` o `admin`. Si Supabase crea un usuario OAuth sin perfil asociado, se debe crear un trigger o una función controlada para insertar el perfil ciudadano por defecto. Esto debe tratarse como una mejora de Sprint 2/3 antes de producción.
