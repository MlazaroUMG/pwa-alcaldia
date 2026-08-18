# ADR 0003: Dashboard admin con shadcn Sidebar y navegacion local

## Estado

Aceptado

## Fecha

2026-08-07

## Contexto

El modulo administrativo debe adaptarse a pantalla completa, usar una estructura inspirada en `shadcn-admin`, incluir sidebar colapsable, modo claro/oscuro, vista de perfil, busqueda y filtros, y conservar las funcionalidades existentes de gestion de incidencias.

El proyecto no usa router y la navegacion existente se basa en estado local dentro de los layouts.

## Alternativas consideradas

- Adoptar React Router o TanStack Router: permitiria rutas reales, pero seria una migracion arquitectonica mayor no requerida para el alcance actual.
- Mantener un `<aside>` manual: evita nuevas piezas de UI, pero no replica bien el patron colapsable de `shadcn-admin`.
- Usar los componentes shadcn `Sidebar`, `Tooltip`, `Sheet` y `Avatar` manteniendo navegacion por estado local: aporta estructura reutilizable sin introducir router.

## Decision

Se implementa el dashboard administrativo con componentes shadcn:

- `SidebarProvider`, `Sidebar`, `SidebarMenuButton` y `SidebarInset` para el shell principal.
- `ThemeProvider` y `ThemeToggle` para modo claro/oscuro.
- `AdminProfileView` como seccion local adicional.
- Navegacion por estado local en `AdminLayout`, sin introducir router.

La aplicacion raiz debe incluir `TooltipProvider` porque el Sidebar usa tooltips cuando esta colapsado.

## Consecuencias positivas

- La UI administrativa queda mas cercana al patron solicitado de `shadcn-admin`.
- Se conserva la arquitectura sin router y se reduce el riesgo de regresion.
- El sidebar colapsable mejora el uso en pantalla completa.
- El modo claro/oscuro queda centralizado en un provider reutilizable.

## Consecuencias negativas

- El componente `Sidebar` de shadcn introduce varias dependencias UI y contexto adicional.
- Algunas rutas no son compartibles por URL mientras se mantenga navegacion por estado local.
- Los tooltips del Sidebar requieren que el arbol este envuelto por `TooltipProvider`.

## Referencias relacionadas

- `src/components/layout/AdminLayout.tsx`.
- `src/components/layout/ThemeProvider.tsx`.
- `src/components/layout/ThemeToggle.tsx`.
- `src/components/admin/AdminProfileView.tsx`.
- `src/components/ui/sidebar.tsx`.
- `src/App.tsx`.
- `AGENTS.md`, secciones 8.2, 8.7 y 16.
