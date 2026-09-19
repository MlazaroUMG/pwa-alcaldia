# Manual administrativo

Dashboard de escritorio. Versión de corte 2026-09-18.

## 1. Acceso

Solo cuentas con rol `admin` en `profiles`. Un ciudadano no ve este módulo:
RLS rechaza las acciones aunque alguien altere la interfaz.

## 2. Bandeja

Lista de tickets nuevos o destacados. Permite abrir el detalle, ver el
perfil del denunciante (nombre, DPI, teléfono, dirección) y la ubicación en
mapa. Los diálogos de perfil y mapa se apilan sobre el detalle; al cerrar el
hijo se recupera el padre.

## 3. Incidencias (tabla)

- Pestañas: Todos, Recibido, En proceso, Resuelto, Descartados.
- Filtros por dependencia y tipo de llamada.
- Búsqueda por folio, título o categoría.
- Paginación 5, 10, 25 o 50 filas.
- Descarte reversible con motivo (no borra la fila ni las fotos).
- Restaurar desde Descartados.

Las transiciones de estado **no** se hacen en esta tabla: se hacen en el
tablero, para que el cambio sea explícito.

## 4. Tablero (Kanban)

Columnas Recibido → En proceso → Resuelto.

- Avanzar: Recibido → En proceso; En proceso abre el cierre.
- Retroceder: limpia fecha de resolución, publicación y foto de cierre.
- Cada cambio queda en `incident_audit_events` (`status_changed`).
- Prioridad “Alta/Media” es **sugerencia** (categoría y antigüedad). No es
  una orden automática.

## 5. Cerrar una incidencia

1. Desde En proceso, **Resolver**.
2. Resumen (límites del formulario).
3. Fotografía de resolución (obligatoria en el diálogo).
4. Marcar si se publica en el muro.
5. El diálogo tiene scroll; confirmar abajo.

La foto se guarda por la Edge Function (ruta + URL firmada). En el detalle y
en el muro se ve completa (`object-contain`).

## 6. Muro público (moderación)

El admin puede editar el resumen publicado y **despublicar**. No eliminar.
A los 30 días una función de base deja `is_public = false`.

## 7. Duplicados y falsos positivos

La heurística avisa casos cercanos y parecidos. No fusiona tickets. Si el
aviso es un falso positivo, se gestiona cada ticket por separado. Nunca se
presenta la sugerencia como decisión final.

## 8. Perfil y tema

Ajustes de perfil y cambio claro/oscuro. El tema se guarda en el navegador.
El avatar muestra las iniciales del nombre y apellido.

## 9. Qué no hacer

- No pedir al ciudadano que “mande el DPI por WhatsApp” si ya está en el
  perfil.
- No capturar pantallas con DPI para la tesis o para redes.
- No publicar el muro con datos que identifiquen a una persona.
- No borrar filas en Supabase para “limpiar” el tablero.
