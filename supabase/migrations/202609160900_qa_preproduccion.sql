-- QA preproducción: folio, descarte, consentimiento, trigger de perfil,
-- Storage privado y auditoría. Usa private.is_admin() (helper remoto vigente).

create schema if not exists private;

create sequence if not exists public.incident_ticket_seq;

alter table public.profiles
  add column if not exists consent_version text,
  add column if not exists consent_accepted_at timestamptz,
  add column if not exists anonymized_at timestamptz,
  add column if not exists deactivation_requested_at timestamptz;

alter table public.incidents
  add column if not exists ticket_number text,
  add column if not exists discarded_at timestamptz,
  add column if not exists discarded_by uuid,
  add column if not exists discard_reason text,
  add column if not exists discard_note text,
  add column if not exists image_path text,
  add column if not exists resolution_image_path text;

create unique index if not exists incidents_ticket_number_key
  on public.incidents (ticket_number);

create unique index if not exists profiles_dpi_unique_idx
  on public.profiles (dpi)
  where dpi is not null and anonymized_at is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_first_name_len_chk'
  ) then
    alter table public.profiles
      add constraint profiles_first_name_len_chk
      check (first_name is null or char_length(first_name) between 2 and 80);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_last_name_len_chk'
  ) then
    alter table public.profiles
      add constraint profiles_last_name_len_chk
      check (last_name is null or char_length(last_name) between 2 and 100);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_address_len_chk'
  ) then
    alter table public.profiles
      add constraint profiles_address_len_chk
      check (address is null or char_length(address) <= 200);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'incidents_title_len_chk'
  ) then
    alter table public.incidents
      add constraint incidents_title_len_chk
      check (char_length(title) between 3 and 140);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'incidents_description_len_chk'
  ) then
    alter table public.incidents
      add constraint incidents_description_len_chk
      check (char_length(description) between 8 and 1200);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'incidents_resolution_len_chk'
  ) then
    alter table public.incidents
      add constraint incidents_resolution_len_chk
      check (
        resolution_summary is null
        or char_length(resolution_summary) between 8 and 700
      );
  end if;
end;
$$;

with numbered as (
  select id, row_number() over (order by created_at, id) as n
  from public.incidents
  where ticket_number is null
)
update public.incidents as incidents
set ticket_number = 'INC-' || lpad(numbered.n::text, 6, '0')
from numbered
where incidents.id = numbered.id;

do $$
begin
  perform setval(
    'public.incident_ticket_seq',
    greatest(
      coalesce(
        (
          select max(substring(ticket_number from 5)::integer)
          from public.incidents
          where ticket_number ~ '^INC-[0-9]+$'
        ),
        0
      ),
      1
    ),
    true
  );
end;
$$;

create or replace function private.assign_ticket_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.ticket_number is null then
    new.ticket_number := 'INC-' || lpad(nextval('public.incident_ticket_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists assign_ticket_number on public.incidents;
create trigger assign_ticket_number
  before insert on public.incidents
  for each row
  execute function private.assign_ticket_number();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    role,
    dpi,
    phone,
    address,
    consent_version,
    consent_accepted_at
  )
  values (
    new.id,
    nullif(trim(meta->>'first_name'), ''),
    nullif(trim(meta->>'last_name'), ''),
    'citizen',
    nullif(trim(meta->>'dpi'), ''),
    nullif(trim(meta->>'phone'), ''),
    nullif(trim(meta->>'address'), ''),
    nullif(trim(meta->>'consent_version'), ''),
    case
      when nullif(trim(meta->>'consent_version'), '') is null then null
      else now()
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_profile_identity() from public, anon, authenticated;

create table if not exists public.incident_audit_events (
  id bigint generated always as identity primary key,
  incident_id uuid not null references public.incidents(id),
  actor_id uuid,
  action text not null,
  reason text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.incident_audit_events enable row level security;
revoke all on table public.incident_audit_events from public, anon;
grant select, insert on table public.incident_audit_events to authenticated;

drop policy if exists "Admins can read incident audit" on public.incident_audit_events;
create policy "Admins can read incident audit"
  on public.incident_audit_events
  for select
  to authenticated
  using (private.is_admin());

create table if not exists public.account_anonymization_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  reason text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.account_anonymization_requests enable row level security;
revoke all on table public.account_anonymization_requests from public, anon;
grant insert, select on table public.account_anonymization_requests to authenticated;

drop policy if exists "Citizens insert own anonymization request" on public.account_anonymization_requests;
create policy "Citizens insert own anonymization request"
  on public.account_anonymization_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Citizens read own anonymization request" on public.account_anonymization_requests;
create policy "Citizens read own anonymization request"
  on public.account_anonymization_requests
  for select
  to authenticated
  using (auth.uid() = user_id or private.is_admin());

create or replace function public.protect_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- auth.uid() nulo permite ajustes operativos desde SQL; el cliente autenticado no.
  if old.role is distinct from new.role and auth.uid() is not null then
    raise exception 'El rol del perfil no puede modificarse desde el cliente.';
  end if;

  if old.dpi is not null and old.dpi is distinct from new.dpi then
    if not (
      new.dpi is null
      and old.anonymized_at is null
      and new.anonymized_at is not null
    ) then
      raise exception 'El DPI no puede modificarse una vez registrado.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_identity on public.profiles;
create trigger protect_profile_identity
  before update on public.profiles
  for each row
  execute function public.protect_profile_identity();

create or replace function public.discard_incidents(
  incident_ids uuid[],
  reason text,
  note text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  affected integer := 0;
begin
  if actor is null or not private.is_admin() then
    raise exception 'Solo el personal administrativo puede descartar incidencias.'
      using errcode = '42501';
  end if;

  if incident_ids is null or array_length(incident_ids, 1) is null then
    return 0;
  end if;

  if reason is null or char_length(trim(reason)) < 8 then
    raise exception 'El motivo de descarte es obligatorio.';
  end if;

  update public.incidents
  set
    discarded_at = now(),
    discarded_by = actor,
    discard_reason = trim(reason),
    discard_note = nullif(trim(coalesce(note, '')), ''),
    is_public = false
  where id = any(incident_ids)
    and discarded_at is null;

  get diagnostics affected = row_count;

  insert into public.incident_audit_events (incident_id, actor_id, action, reason, note)
  select unnest(incident_ids), actor, 'discard', trim(reason), nullif(trim(coalesce(note, '')), '');

  return affected;
end;
$$;

create or replace function public.restore_incidents(incident_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  affected integer := 0;
begin
  if actor is null or not private.is_admin() then
    raise exception 'Solo el personal administrativo puede restaurar incidencias.'
      using errcode = '42501';
  end if;

  update public.incidents
  set
    discarded_at = null,
    discarded_by = null,
    discard_reason = null,
    discard_note = null
  where id = any(incident_ids)
    and discarded_at is not null;

  get diagnostics affected = row_count;

  insert into public.incident_audit_events (incident_id, actor_id, action)
  select unnest(incident_ids), actor, 'restore';

  return affected;
end;
$$;

revoke all on function public.discard_incidents(uuid[], text, text) from public, anon;
revoke all on function public.restore_incidents(uuid[]) from public, anon;
grant execute on function public.discard_incidents(uuid[], text, text) to authenticated;
grant execute on function public.restore_incidents(uuid[]) to authenticated;

drop policy if exists "Citizens can view own incidents" on public.incidents;
drop policy if exists "Admins can view all incidents" on public.incidents;
drop policy if exists "Incidents readable by owner or admin" on public.incidents;

create policy "Incidents readable by owner or admin"
  on public.incidents
  for select
  to authenticated
  using (
    private.is_admin()
    or (
      auth.uid() = user_id
      and discarded_at is null
    )
  );

create or replace function public.get_community_board()
returns table (
  category text,
  resolution_summary text,
  resolution_image_url text,
  resolved_at timestamptz,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    incidents.category,
    incidents.resolution_summary,
    incidents.resolution_image_url,
    incidents.resolved_at,
    incidents.published_at
  from public.incidents
  where incidents.is_public = true
    and incidents.status = 'Resuelto'
    and incidents.discarded_at is null
    and incidents.published_at >= now() - interval '30 days'
  order by incidents.published_at desc;
$$;

create or replace function public.suggest_incident_duplicates(
  input_latitude double precision,
  input_longitude double precision,
  input_description text,
  input_category text,
  input_dependency text,
  input_call_type_code integer
)
returns table (
  category text,
  call_type_code integer,
  call_type_label text,
  approximate_distance_m integer,
  text_similarity real,
  created_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  requester_id uuid := (select auth.uid());
begin
  if requester_id is null then
    raise exception 'Se requiere autenticacion.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = requester_id
      and role = 'citizen'
      and anonymized_at is null
      and dpi ~ '^[0-9]{13}$'
      and phone ~ '^[0-9]{8}$'
  ) then
    raise exception 'Completa el perfil antes de consultar duplicados.'
      using errcode = '42501';
  end if;

  delete from private.duplicate_check_log
  where user_id = requester_id
    and checked_at < now() - interval '24 hours';

  if (
    select count(*)
    from private.duplicate_check_log
    where user_id = requester_id
      and checked_at >= now() - interval '1 hour'
  ) >= 20 then
    raise exception 'Limite temporal de consultas alcanzado.'
      using errcode = '42900';
  end if;

  insert into private.duplicate_check_log (user_id)
  values (requester_id);

  return query
  with candidates as (
    select
      incidents.category,
      incidents.dependency,
      incidents.call_type_code,
      incidents.call_type_label,
      incidents.created_at,
      extensions.similarity(
        lower(coalesce(incidents.description, '')),
        lower(coalesce(input_description, ''))
      )::real as similarity_score,
      6371000 * 2 * asin(
        least(
          1::double precision,
          sqrt(
            power(sin(radians(incidents.latitude - input_latitude) / 2), 2)
            + cos(radians(input_latitude))
            * cos(radians(incidents.latitude))
            * power(sin(radians(incidents.longitude - input_longitude) / 2), 2)
          )
        )
      ) as distance_m
    from public.incidents
    where input_latitude between -90 and 90
      and input_longitude between -180 and 180
      and incidents.discarded_at is null
      and incidents.status in ('Pendiente', 'En Progreso')
      and incidents.created_at >= now() - interval '14 days'
      and incidents.latitude is not null
      and incidents.longitude is not null
  )
  select
    candidates.category,
    candidates.call_type_code,
    candidates.call_type_label,
    case when candidates.distance_m <= 40 then 40 else 80 end,
    round(candidates.similarity_score::numeric, 2)::real,
    date_trunc('day', candidates.created_at)
  from candidates
  where candidates.distance_m <= 80
    and (
      (
        input_call_type_code is not null
        and candidates.call_type_code = input_call_type_code
        and candidates.dependency is not distinct from input_dependency
      )
      or (
        candidates.category = input_category
        and candidates.similarity_score >= 0.25
      )
    )
  order by candidates.distance_m, candidates.similarity_score desc
  limit 3;
end;
$$;

create or replace function public.anonymize_citizen_profile()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'Se requiere autenticacion.'
      using errcode = '42501';
  end if;

  if exists (select 1 from public.profiles where id = actor and role = 'admin') then
    raise exception 'Las cuentas administrativas no se anonimizan desde la PWA.';
  end if;

  insert into public.account_anonymization_requests (user_id, reason)
  values (actor, 'solicitud_ciudadana');

  update public.profiles
  set
    first_name = 'Cuenta',
    last_name = 'anonimizada',
    dpi = null,
    phone = null,
    address = null,
    consent_version = null,
    anonymized_at = now(),
    deactivation_requested_at = now()
  where id = actor
    and anonymized_at is null;

  delete from public.push_subscriptions
  where user_id = actor;
end;
$$;

revoke all on function public.anonymize_citizen_profile() from public, anon;
grant execute on function public.anonymize_citizen_profile() to authenticated;

update storage.buckets
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'incident-photos';

drop policy if exists "Public Access to Photos" on storage.objects;
drop policy if exists "Citizens can upload photos" on storage.objects;
drop policy if exists "Authenticated read own incident photos" on storage.objects;
drop policy if exists "Admins read incident photos" on storage.objects;

create policy "Authenticated read own incident photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'incident-photos'
    and (
      private.is_admin()
      or split_part(name, '/', 1) = auth.uid()::text
    )
  );

comment on column public.incidents.ticket_number is
  'Folio visible secuencial. El UUID permanece como clave primaria.';
comment on column public.incidents.discarded_at is
  'Marca de descarte reversible. No implica borrado fisico.';
