-- Permite que el personal administrativo registre transiciones de estado
-- desde el cliente. El descarte sigue pasando por RPC SECURITY DEFINER.
-- Aplicada en remoto el 2026-09-18 sobre cgpwabpfadbtbohxowxz.

drop policy if exists "Admins can insert incident audit" on public.incident_audit_events;
create policy "Admins can insert incident audit"
  on public.incident_audit_events
  for insert
  to authenticated
  with check (private.is_admin());
