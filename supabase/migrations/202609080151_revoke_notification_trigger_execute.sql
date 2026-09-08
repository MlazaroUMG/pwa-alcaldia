-- Impide que anon/authenticated invoquen por RPC las funciones de trigger.
-- Los triggers siguen ejecutandose con los privilegios del definer.

revoke execute on function public.notifications_guard_client_update() from public, anon, authenticated;
revoke execute on function public.notify_admins_on_incident_insert() from public, anon, authenticated;
revoke execute on function public.notify_owner_on_incident_status() from public, anon, authenticated;
revoke execute on function public.notify_citizens_on_wall_publish() from public, anon, authenticated;
