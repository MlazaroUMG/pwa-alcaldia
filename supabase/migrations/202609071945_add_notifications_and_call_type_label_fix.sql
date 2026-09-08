-- Sprint 5: notificaciones persistidas y etiquetas 509/511 sin sufijo de regencia.
-- Las funciones SECURITY DEFINER existen para que los triggers inserten filas
-- pese a RLS (el cliente no tiene INSERT). search_path queda fijado a public.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  incident_id uuid references public.incidents (id) on delete set null,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check
    check (type in ('incident_received', 'status_changed', 'wall_published'))
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

comment on table public.notifications is
  'Avisos persistidos por usuario. El muro solo guarda categoria y texto generico.';

comment on column public.notifications.type is
  'incident_received (admins), status_changed (dueno), wall_published (ciudadanos).';

alter table public.notifications enable row level security;

revoke all on table public.notifications from public, anon;
grant select, update on table public.notifications to authenticated;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.notifications_guard_client_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.id is distinct from old.id
     or new.user_id is distinct from old.user_id
     or new.incident_id is distinct from old.incident_id
     or new.type is distinct from old.type
     or new.title is distinct from old.title
     or new.body is distinct from old.body
     or new.created_at is distinct from old.created_at then
    raise exception 'Solo se puede marcar la notificacion como leida.';
  end if;

  return new;
end;
$$;

comment on function public.notifications_guard_client_update() is
  'Impide que el cliente altere campos distintos de read_at en notifications.';

drop trigger if exists notifications_guard_client_update on public.notifications;
create trigger notifications_guard_client_update
  before update on public.notifications
  for each row
  execute procedure public.notifications_guard_client_update();

-- SECURITY DEFINER: inserta avisos a varios destinatarios sin exponer INSERT al cliente.
create or replace function public.notify_admins_on_incident_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, incident_id, type, title, body)
  select
    profiles.id,
    new.id,
    'incident_received',
    'Nueva incidencia recibida',
    'Hay una incidencia de ' || coalesce(new.category, 'categoria general') || ' pendiente de revision.'
  from public.profiles
  where profiles.role = 'admin';

  return new;
end;
$$;

comment on function public.notify_admins_on_incident_insert() is
  'SECURITY DEFINER. Tras INSERT en incidents, crea una fila por cada perfil admin.';

drop trigger if exists notify_admins_on_incident_insert on public.incidents;
create trigger notify_admins_on_incident_insert
  after insert on public.incidents
  for each row
  execute procedure public.notify_admins_on_incident_insert();

create or replace function public.notify_owner_on_incident_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  status_label text;
begin
  if new.status is not distinct from old.status or new.user_id is null then
    return new;
  end if;

  status_label := case new.status
    when 'Pendiente' then 'Recibido'
    when 'En Progreso' then 'En proceso'
    when 'Resuelto' then 'Resuelto'
    else new.status
  end;

  insert into public.notifications (user_id, incident_id, type, title, body)
  values (
    new.user_id,
    new.id,
    'status_changed',
    'Tu incidencia cambio de estado',
    'El estado actual es ' || status_label || '.'
  );

  return new;
end;
$$;

comment on function public.notify_owner_on_incident_status() is
  'SECURITY DEFINER. Notifica al ciudadano dueno cuando cambia incidents.status.';

drop trigger if exists notify_owner_on_incident_status on public.incidents;
create trigger notify_owner_on_incident_status
  after update of status on public.incidents
  for each row
  execute procedure public.notify_owner_on_incident_status();

create or replace function public.notify_citizens_on_wall_publish()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_public is not true
     or old.is_public is true
     or new.status is distinct from 'Resuelto' then
    return new;
  end if;

  insert into public.notifications (user_id, incident_id, type, title, body)
  select
    profiles.id,
    new.id,
    'wall_published',
    'Nueva resolucion en el muro comunitario',
    'Se publico una resolucion de ' || coalesce(new.category, 'una incidencia') || '.'
  from public.profiles
  where profiles.role = 'citizen';

  return new;
end;
$$;

comment on function public.notify_citizens_on_wall_publish() is
  'SECURITY DEFINER. Avisa a ciudadanos al publicar en el muro, sin identidad ni coordenadas.';

drop trigger if exists notify_citizens_on_wall_publish on public.incidents;
create trigger notify_citizens_on_wall_publish
  after update of is_public on public.incidents
  for each row
  execute procedure public.notify_citizens_on_wall_publish();

alter table public.incidents
  drop constraint if exists incidents_call_type_dependency_check;

update public.incidents
set call_type_label = 'LIMPIEZA DE CUNETAS'
where call_type_code = 509
  and call_type_label is distinct from 'LIMPIEZA DE CUNETAS';

update public.incidents
set call_type_label = 'LIMPIEZA DE TRAGANTES'
where call_type_code = 511
  and call_type_label is distinct from 'LIMPIEZA DE TRAGANTES';

alter table public.incidents
  add constraint incidents_call_type_dependency_check
  check (
    (
      dependency is null
      and call_type_code is null
      and call_type_label is null
    )
    or (
      dependency = 'Regencia Norte - Servicios'
      and (
        (call_type_code = 501 and call_type_label = 'MANTENIMIENTO DE ÁREAS VERDES')
        or (call_type_code = 502 and call_type_label = 'MANTENIMIENTO DE JARDINES EN BOULEVARES PRINCIPALES')
        or (call_type_code = 503 and call_type_label = 'JARDINIZACIONES')
        or (call_type_code = 504 and call_type_label = 'PODAS Y TALAS MENORES')
        or (call_type_code = 505 and call_type_label = 'CHAPEO')
        or (call_type_code = 506 and call_type_label = 'REFORESTACIONES')
        or (call_type_code = 507 and call_type_label = 'RETIRO DE RIPIO')
        or (call_type_code = 508 and call_type_label = 'LIMPIEZA DE REJILLAS')
        or (call_type_code = 509 and call_type_label = 'LIMPIEZA DE CUNETAS')
        or (call_type_code = 510 and call_type_label = 'LIMPIEZA DE BASUREROS CLANDESTINOS')
        or (call_type_code = 511 and call_type_label = 'LIMPIEZA DE TRAGANTES')
        or (call_type_code = 512 and call_type_label = 'BACHEO')
        or (call_type_code = 513 and call_type_label = 'PINTURA DE BORDILLOS')
      )
    )
    or (
      dependency = 'Empagua - Distribución'
      and (
        (call_type_code = 601 and call_type_label = 'FUGAS DE AGUA')
        or (call_type_code = 602 and call_type_label = 'FALTAS DE AGUA SECTORIAL')
        or (call_type_code = 603 and call_type_label = 'FALTAS DE AGUA LOCAL (DOMICILIAR)')
        or (call_type_code = 604 and call_type_label = 'MANEJO Y COLOCACIÓN DE LLAVE DE PASO')
        or (call_type_code = 605 and call_type_label = 'SOLICITUD DE RELLENOS POR REPARACIONES DE EMPAGUA')
        or (call_type_code = 606 and call_type_label = 'CONSULTAS - EMPAGUA - DISTRIBUCIÓN')
        or (call_type_code = 608 and call_type_label = 'RIPIO POR TRABAJOS DE EMPAGUA')
        or (call_type_code = 609 and call_type_label = 'BANQUETAS POR TRABAJOS DE EMPAGUA')
      )
    )
    or (
      dependency = 'Empagua - Sistemas Drenajes'
      and (
        (call_type_code = 701 and call_type_label = 'DRENAJES (TRAGANTES)')
        or (call_type_code = 702 and call_type_label = 'HUNDIMENTOS')
        or (call_type_code = 703 and call_type_label = 'COLOCACION DE TAPADERAS DE REGISTRO')
        or (call_type_code = 704 and call_type_label = 'DESAGÜES A FLOR DE TIERRA')
        or (call_type_code = 705 and call_type_label = 'SOLICITUDES')
        or (call_type_code = 706 and call_type_label = 'CONSULTAS - SISTEMA DRENAJES')
        or (call_type_code = 707 and call_type_label = 'DRENAJE CON FUGA')
        or (call_type_code = 709 and call_type_label = 'TAPADERAS DE DRENAJE (TRAGANTE)')
      )
    )
  );
