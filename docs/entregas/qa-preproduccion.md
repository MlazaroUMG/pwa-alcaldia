# Entrega QA de preproducción

Fecha original: 2026-09-16. Actualizado: 2026-09-18.

## Qué se entregó

- ADR 0008 de descarte, anonimización y validación.
- Migración local `202609160900_qa_preproduccion.sql`.
- Edge Functions `upload-incident-photo` y `anonymize-account`.
- Validación centralizada, contraseña 12–64, recuperación dedicada, consentimiento versionado.
- Folio `INC-000001`, descarte/restauración auditable, tema claro ciudadano, galería, Push contextual.

## Aplicación remota (2026-09-17)

Sobre el proyecto Supabase `cgpwabpfadbtbohxowxz`:

1. Se aplicó `qa_preproduccion` (folio, descarte, Storage privado, auditoría).
2. Se aplicó `qa_revoke_protect_profile_rpc`.
3. Se desplegaron `upload-incident-photo` (v2, path + URL firmada) y `anonymize-account`.
4. Se aplicó `community_resolution_photos` para lectura pública de fotos de resolución publicadas.

`send-push` se mantuvo con autenticación por `PUSH_WEBHOOK_SECRET`.

## Qué no se hizo en QA

- No se cambió Vercel Production.
- No se versionaron credenciales.
- El CHECK geográfico de Pinares del Norte no se migró (queda como deuda).

## Cómo verificar

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

La humo de Playwright cubre la pantalla de acceso. Los flujos autenticados requieren sesión real.
