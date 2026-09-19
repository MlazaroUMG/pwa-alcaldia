# Manual ciudadano

PWA de la Alcaldía Auxiliar de Zona 18, Distrito IV. Versión de corte
2026-09-18.

## 1. Instalación

### Android (Chrome)

1. Abrir la URL HTTPS de la aplicación (cuando exista Production).
2. Menú del navegador → **Agregar a la pantalla de inicio** o el aviso
   “Instalar”.
3. El icono debe mostrar el escudo institucional. La app abre a pantalla
   completa.

### iOS (Safari)

1. Abrir la URL en Safari.
2. Compartir → **Agregar a pantalla de inicio**.
3. Las notificaciones push en iOS solo funcionan si la PWA está instalada.

En desarrollo local (`npm run dev`) la instalación PWA no es el escenario
oficial. El Service Worker se registra en el build de producción.

## 2. Registro e inicio de sesión

- Correo y contraseña (12 a 64 caracteres, con mayúscula, minúscula, número
  y símbolo) o **Continuar con Google**.
- Nombre, apellido, DPI y teléfono son obligatorios. La dirección es
  opcional.
- Hay que aceptar el aviso de privacidad y las reglas de uso.
- Si Google no trae DPI o teléfono, aparece “Completa tu perfil” antes de
  entrar.
- “¿Olvidaste tu contraseña?” abre un flujo propio; no reutiliza el correo
  del login.

## 3. Reportar una incidencia

1. Inicio → **Reportar**.
2. Elegir categoría o dejar que se ajuste al tipo de llamada.
3. Título y descripción en español, con los límites del formulario.
4. Dependencia y tipo de llamada.
5. Fotografía: cámara o galería. JPG, PNG o WEBP, máximo 5 MB.
6. Ubicación: GPS o toque en el mapa. Solo se aceptan puntos dentro de
   **Pinares del Norte, Zona 18, Distrito IV**. El polígono es operativo, no
   un deslinde catastral.
7. Si hay un caso abierto parecido a menos de 80 m, aparece una sugerencia.
   Se puede cancelar o enviar de todos modos. La decisión es del ciudadano.

Al guardar se asigna un folio `INC-000001` y el estado Recibido (Pendiente).

## 4. Estados de seguimiento

En **Mis tickets**:

- Recibido (Pendiente)
- En proceso
- Resuelto, con foto y resumen de la Alcaldía

La evidencia propia puede verse recortada en la miniatura; la resolución se
muestra completa.

## 5. Muro comunitario

Muestra resoluciones públicas recientes: categoría, resumen, foto de cierre
y fecha. No muestra quién reportó, ni DPI, ni la dirección, ni el punto
exacto, ni el texto original. Las publicaciones se retiran a los 30 días;
el ticket interno permanece.

## 6. Notificaciones

La campana de la barra superior guarda avisos de estado y de muro. Si el
navegador permite Web Push y la Alcaldía lo configuró, también puede llegar
un aviso del sistema. Si se niega el permiso, la campana sigue funcionando.

## 7. Privacidad

Los datos del perfil y las fotos de evidencia los ve el titular y el
personal administrativo autenticado. El ciudadano puede pedir el retiro de
su cuenta desde Ajustes: se anonimiza el perfil y se desactiva el acceso;
los tickets se conservan sin datos personales.

## 8. Problemas frecuentes

| Síntoma | Qué hacer |
| --- | --- |
| “La ubicación debe estar dentro de Pinares del Norte…” | Mover el marcador dentro del polígono azul |
| GPS denegado | Permitir ubicación o marcar el punto a mano |
| Foto rechazada | Bajar a menos de 5 MB y usar JPG/PNG/WEBP |
| No entra después de Google | Completar DPI, teléfono y nombre |
| Tema vuelve a claro | Cambiar Sol/Luna; debe sobrevivir a recargar |
| No instala en el teléfono | Hace falta la URL HTTPS de producción |
