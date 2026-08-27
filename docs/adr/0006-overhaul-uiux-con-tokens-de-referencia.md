# 0006. Overhaul UI/UX con tokens de referencia

## Fecha

2026-08-26

## Estado

Aceptado

## Contexto

El proyecto requiere reemplazar la interfaz actual por una experiencia más clara e intuitiva para dos contextos distintos: módulo ciudadano mobile-first y módulo administrativo desktop-first. La referencia visual se encuentra temporalmente en `_design-reference`, generada desde mockups, y contiene estructura de pantallas, componentes, tokens visuales y datos ficticios.

La arquitectura funcional vigente se mantiene: React, TypeScript, Vite, Tailwind CSS, shadcn/ui y Supabase. Los datos mock de la referencia no deben integrarse al producto final ni reemplazar los flujos reales de autenticación, perfiles, incidencias, almacenamiento o políticas RLS.

## Alternativas consideradas

- Mantener la UI actual y ajustar solo colores. Esta alternativa no resuelve la necesidad de mejorar usabilidad ni consistencia entre pantallas.
- Importar directamente componentes desde `_design-reference`. Se descarta porque convertiría la referencia en dependencia productiva y arrastraría datos mock.
- Adaptar visualmente la referencia dentro de la estructura existente. Esta opción conserva la arquitectura, permite revisar por fases y reduce el riesgo funcional.

## Decisión

Se adaptará la estructura visual y los tokens de `_design-reference` dentro de los componentes reales de `src/`, reemplazando los datos mock por Auth/Supabase y manteniendo los contratos actuales del sistema.

El módulo ciudadano se mantendrá mobile-first con ancho máximo centrado de 448 px. El módulo administrativo ocupará pantalla completa en desktop. El login y registro usarán la estructura visual del mockup, pero el rol se resolverá desde `profiles` luego de autenticar y la creación de cuenta será solo para ciudadanos.

Se agregan `profiles.first_name` y `profiles.last_name` como columnas nullable para respaldar el registro ciudadano y la visualización de perfiles sin romper usuarios existentes.

## Consecuencias positivas

- La interfaz podrá evolucionar por fases verificables con validación visual.
- Se conserva la separación entre prototipo visual y producto real.
- Los nombres de usuario quedan disponibles en perfiles sin depender solamente de metadata de Auth.
- Los colores municipales y tokens de referencia quedan centralizados para reutilización.

## Consecuencias negativas

- El overhaul toca varios componentes y requiere validación visual cuidadosa por pantalla.
- La migración de perfiles debe aplicarse en Supabase antes de depender de los campos nuevos en producción.
- Algunos estados visuales del mockup deben mapearse al flujo real `Pendiente -> En Progreso -> Resuelto` para evitar cambios de contrato no aprobados.

## Referencias relacionadas

- `AGENTS.md`
- `_design-reference`
- `supabase/migrations/202608261306_add_profile_name_fields.sql`
- `src/lib/supabase.types.ts`
