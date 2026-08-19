# ADR 0001: Usar Supabase como backend y RLS como autorizacion

## Estado

Aceptado

## Fecha

2026-08-07

## Contexto

El proyecto requiere autenticacion, almacenamiento de fotografias, persistencia de incidencias, perfiles por rol y reglas de acceso diferenciadas entre ciudadanos, administradores y visitantes anonimos. Actualmente no existe un backend propio en el repositorio y la aplicacion se ejecuta como PWA React/Vite.

La informacion manejada incluye datos sensibles: DPI, telefono, direccion, coordenadas y evidencias fotograficas. Por tanto, las restricciones de acceso no pueden depender solo de condicionales de interfaz.

## Alternativas consideradas

- Crear un backend propio con Node/NestJS u otra tecnologia: daria mayor control, pero aumentaria alcance, despliegue, mantenimiento y superficie de seguridad.
- Usar solo filtrado en cliente con Supabase abierto: simplifica el frontend, pero no protege datos sensibles.
- Usar Supabase Auth, Database, Storage y Row Level Security: mantiene el alcance acotado y permite aplicar permisos en la base de datos.

## Decision

Se usa Supabase como backend principal del sistema:

- Supabase Auth para registro, inicio de sesion y sesiones.
- PostgreSQL de Supabase para `profiles` e `incidents`.
- Supabase Storage para fotografias de incidencias.
- Row Level Security como frontera real de autorizacion por rol.

La UI puede ocultar o mostrar acciones segun el rol, pero la autorizacion efectiva debe residir en politicas RLS y funciones SQL controladas.

## Consecuencias positivas

- Menor complejidad operacional al no mantener un backend propio.
- Autorizacion centralizada en la base de datos.
- Integracion directa con el frontend React mediante `@supabase/supabase-js`.
- El modelo se ajusta al alcance academico y al avance actual del proyecto.

## Consecuencias negativas

- La logica de permisos depende fuertemente de politicas RLS correctamente diseñadas.
- Los cambios de esquema o RLS son de riesgo alto y requieren revision explicita.
- Algunas reglas de negocio complejas podrian requerir Supabase Edge Functions en fases futuras.

## Referencias relacionadas

- `AGENTS.md`, secciones 8.3, 8.4, 8.5 y 18.3.
- `src/lib/supabaseClient.ts`.
- `src/lib/supabase.types.ts`.
- Proyecto Supabase `cgpwabpfadbtbohxowxz`.
