# ADR 0005: Modelo de perfiles ciudadanos extendidos y RLS admin

## Estado

Aceptado

## Fecha

2026-08-07

## Contexto

El registro ciudadano debe capturar correo, contraseña, DPI, telefono y direccion opcional. Estos datos se usan para verificar identidad desde el modulo administrativo al gestionar incidencias.

El sistema tambien requiere que:

- Los ciudadanos solo puedan ver y crear sus propias incidencias.
- Los administradores puedan ver todas las incidencias y los perfiles ciudadanos necesarios para gestionarlas.
- El Community Board solo exponga informacion anonimizada de incidencias resueltas y publicas.

Antes de la decision, existian politicas RLS demasiado permisivas para `incidents` y demasiado restrictivas para que un admin leyera perfiles de otros usuarios.

## Alternativas consideradas

- Guardar DPI, telefono y direccion en metadatos de Supabase Auth: acopla datos de dominio a Auth y dificulta consultas administrativas.
- Crear una tabla separada para datos personales ciudadanos: ofrece separacion fina, pero agrega complejidad innecesaria para el alcance actual.
- Extender `profiles` con campos nullable y reforzar RLS por rol: mantiene el modelo simple y permite evolucionar sin romper perfiles existentes.

## Decision

Se extiende `profiles` con:

- `dpi text`
- `phone text`
- `address text`

Se extiende `incidents` con:

- `latitude double precision`
- `longitude double precision`

Se implementa una funcion `public.is_admin()` y politicas RLS para que:

- Un ciudadano lea y actualice su perfil.
- Un administrador lea perfiles e incidencias necesarias para gestion.
- Solo administradores actualicen incidencias.
- Visitantes anonimos solo lean incidencias publicas resueltas.

Las columnas nuevas permanecen nullable para no romper perfiles o incidencias existentes.

## Consecuencias positivas

- Los datos de verificacion ciudadana quedan disponibles para el modulo administrativo.
- La proteccion de datos sensibles se aplica en la base de datos y no solo en la UI.
- El modelo es aditivo y evita migraciones destructivas.
- La anonimizacion del Community Board queda reforzada por RLS y por seleccion limitada de columnas.

## Consecuencias negativas

- Las politicas RLS se vuelven mas importantes y requieren revision cuidadosa.
- Los perfiles existentes pueden no tener DPI o telefono hasta que se actualicen.
- La funcion `is_admin()` debe mantenerse controlada y revisarse en advisories de Supabase.

## Referencias relacionadas

- `src/lib/supabase.types.ts`.
- `src/components/auth/RegisterForm.tsx`.
- `src/components/admin/SubmitterProfileDialog.tsx`.
- `src/components/admin/AdminInboxView.tsx`.
- `src/components/admin/AdminTicketTable.tsx`.
- `AGENTS.md`, secciones 8.3, 8.5, 16 y 18.3.
