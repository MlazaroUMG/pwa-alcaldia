-- Endurecimiento previo a produccion: privilegios, RLS y datos publicos.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
create policy "Profiles readable by owner or admin"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and role = 'citizen'
  );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function private.protect_profile_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'authenticated' then
    if tg_op = 'INSERT' then
      new.role := 'citizen';
    elsif new.id is distinct from old.id
       or new.role is distinct from old.role
       or new.created_at is distinct from old.created_at then
      raise exception 'No se permite modificar identidad, rol o fecha del perfil.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_profile_identity()
  from public, anon, authenticated;

drop trigger if exists protect_profile_identity on public.profiles;
create trigger protect_profile_identity
  before insert or update on public.profiles
  for each row
  execute procedure private.protect_profile_identity();

drop policy if exists "Incidents readable by owner admin or public resolved"
  on public.incidents;
create policy "Incidents readable by owner or admin"
  on public.incidents
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists "Authenticated users can insert incidents"
  on public.incidents;
create policy "Citizens can insert valid own incidents"
  on public.incidents
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'Pendiente'
    and is_public = false
    and resolution_summary is null
    and resolution_image_url is null
    and resolved_at is null
    and published_at is null
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'citizen'
        and dpi ~ '^[0-9]{13}$'
        and phone ~ '^[0-9]{8}$'
    )
  );

drop policy if exists "Only admins can update incidents" on public.incidents;
create policy "Only admins can update incidents"
  on public.incidents
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create or replace view public.community_board_public
with (security_barrier = true)
as
select
  category,
  resolution_summary,
  resolution_image_url,
  resolved_at,
  published_at
from public.incidents
where is_public = true
  and status = 'Resuelto'
  and published_at >= now() - interval '30 days';

comment on view public.community_board_public is
  'Proyeccion publica intencionalmente limitada; nunca expone identidad, descripcion, foto original ni coordenadas.';

revoke all on table public.community_board_public from public;
grant select on table public.community_board_public to anon, authenticated;

revoke all on table public.profiles from public, anon;
revoke all on table public.incidents from public, anon;
revoke all on table public.notifications from public, anon;

revoke delete, truncate, references, trigger
  on table public.profiles, public.incidents, public.notifications
  from authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.incidents to authenticated;
revoke update on table public.notifications from authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create index if not exists incidents_user_id_idx
  on public.incidents (user_id);
create index if not exists notifications_incident_id_idx
  on public.notifications (incident_id);

create table if not exists private.duplicate_check_log (
  user_id uuid not null,
  checked_at timestamptz not null default now()
);

alter table private.duplicate_check_log enable row level security;
revoke all on table private.duplicate_check_log from public, anon, authenticated;

create index if not exists duplicate_check_log_user_time_idx
  on private.duplicate_check_log (user_id, checked_at desc);

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

revoke all on function public.suggest_incident_duplicates(
  double precision,
  double precision,
  text,
  text,
  text,
  integer
) from public, anon;
grant execute on function public.suggest_incident_duplicates(
  double precision,
  double precision,
  text,
  text,
  text,
  integer
) to authenticated;

revoke all on function public.rls_auto_enable()
  from public, anon, authenticated;

drop function if exists public.is_admin();
