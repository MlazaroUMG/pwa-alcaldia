# Política de privacidad y retención (operativa)

Complementa `docs/legal/aviso-privacidad.md`. No es dictamen jurídico.
Versión 2026-09-18.

## Responsable

Alcaldía Auxiliar de Zona 18, Distrito IV, Municipalidad de Guatemala.

## Finalidad

Recibir, verificar, gestionar y resolver reportes de infraestructura y
servicios locales; notificar avances; publicar resoluciones anonimizadas
cuando un administrador lo autorice.

## Datos y tratamiento

| Dato | Finalidad | Quién lo ve | Retención |
| --- | --- | --- | --- |
| Nombre y apellido | Identificar al denunciante | Titular y admin | Hasta anonimización de cuenta |
| Correo | Auth y avisos | Titular, Auth, admin | Hasta baja de Auth |
| DPI | Verificación municipal | Titular y admin | Inmutable; se anula al anonimizar |
| Teléfono | Contacto operativo | Titular y admin | Hasta anonimización |
| Dirección | Contexto opcional | Titular y admin | Hasta anonimización |
| Coordenadas | Localizar el hecho | Titular y admin; nunca el muro | Con el ticket |
| Foto de evidencia | Verificar el hecho | Titular y admin | Con el ticket; bucket privado |
| Foto y resumen de resolución | Cerrar y, si aplica, publicar | Titular, admin; muro si `is_public` | Ticket permanente; muro ≤ 30 días |
| Suscripción push | Avisos de dispositivo | Sistema | Hasta que se desactive |

## Acceso

RLS impide que un ciudadano lea el perfil o los tickets de otra persona. El
muro solo expone categoría, resumen, imagen de resolución y fechas.

## Solicitudes del titular

Desde Ajustes puede actualizar contacto (no el DPI fijado) y pedir el retiro
de cuenta. La Edge Function `anonymize-account` anonimiza el perfil y
desactiva el acceso. Los tickets se conservan para la trazabilidad municipal
sin datos personales del titular.

## Lo que no se hace

- No se venden datos.
- No se envían descripciones ni coordenadas a un proveedor de IA.
- No se versionan DPI ni credenciales en Git ni en anexos de tesis.
