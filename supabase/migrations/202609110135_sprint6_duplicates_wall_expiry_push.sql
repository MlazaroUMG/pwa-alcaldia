-- Sprint 6: IA de apoyo, expiracion no destructiva del muro y Web Push.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

alter table public.incidents
  add column if not exists published_at timestamptz;

comment on column public.incidents.published_at is
  'Fecha de la publicacion mas reciente en el muro comunitario.';

update public.incidents
set published_at = coalesce(resolved_at, created_at, now())
where is_public = true
  and published_at is null;

create or replace function public.set_incident_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_public = true
     and (
       tg_op = 'INSERT'
       or old.is_public is distinct from true
       or new.published_at is null
     ) then
    new.published_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists set_incident_published_at on public.incidents;
create trigger set_incident_published_at
  before insert or update of is_public on public.incidents
  for each row
  execute procedure public.set_incident_published_at();

create or replace function public.unpublish_expired_wall_posts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer;
begin
  update public.incidents
  set is_public = false
  where is_public = true
    and published_at < now() - interval '30 days';

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

comment on function public.unpublish_expired_wall_posts() is
  'Despublica publicaciones con mas de 30 dias sin eliminar incidencias.';

revoke execute on function public.set_incident_published_at()
  from public, anon, authenticated;
revoke execute on function public.unpublish_expired_wall_posts()
  from public, anon, authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'unpublish-expired-wall-posts'
  limit 1;

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'unpublish-expired-wall-posts',
    '15 3 * * *',
    'select public.unpublish_expired_wall_posts();'
  );
end;
$$;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

revoke all on table public.push_subscriptions from public, anon;
grant select, insert, update, delete
  on table public.push_subscriptions to authenticated;

drop policy if exists push_subscriptions_select_own
  on public.push_subscriptions;
create policy push_subscriptions_select_own
  on public.push_subscriptions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists push_subscriptions_insert_own
  on public.push_subscriptions;
create policy push_subscriptions_insert_own
  on public.push_subscriptions
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists push_subscriptions_update_own
  on public.push_subscriptions;
create policy push_subscriptions_update_own
  on public.push_subscriptions
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists push_subscriptions_delete_own
  on public.push_subscriptions;
create policy push_subscriptions_delete_own
  on public.push_subscriptions
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create index if not exists incidents_description_trgm_idx
  on public.incidents
  using gin (description extensions.gin_trgm_ops);

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
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    incidents.category,
    incidents.call_type_code,
    incidents.call_type_label,
    round(
      6371000 * 2 * asin(
        sqrt(
          power(sin(radians(incidents.latitude - input_latitude) / 2), 2)
          + cos(radians(input_latitude))
          * cos(radians(incidents.latitude))
          * power(sin(radians(incidents.longitude - input_longitude) / 2), 2)
        )
      )
    )::integer as approximate_distance_m,
    extensions.similarity(
      lower(coalesce(incidents.description, '')),
      lower(coalesce(input_description, ''))
    )::real as text_similarity,
    incidents.created_at
  from public.incidents
  where auth.uid() is not null
    and input_latitude between -90 and 90
    and input_longitude between -180 and 180
    and incidents.status in ('Pendiente', 'En Progreso')
    and incidents.created_at >= now() - interval '14 days'
    and incidents.latitude is not null
    and incidents.longitude is not null
    and (
      6371000 * 2 * asin(
        sqrt(
          power(sin(radians(incidents.latitude - input_latitude) / 2), 2)
          + cos(radians(input_latitude))
          * cos(radians(incidents.latitude))
          * power(sin(radians(incidents.longitude - input_longitude) / 2), 2)
        )
      )
    ) <= 80
    and (
      (
        input_call_type_code is not null
        and incidents.call_type_code = input_call_type_code
        and incidents.dependency is not distinct from input_dependency
      )
      or (
        incidents.category = input_category
        and extensions.similarity(
          lower(coalesce(incidents.description, '')),
          lower(coalesce(input_description, ''))
        ) >= 0.25
      )
    )
  order by approximate_distance_m, text_similarity desc
  limit 3;
$$;

comment on function public.suggest_incident_duplicates(
  double precision,
  double precision,
  text,
  text,
  text,
  integer
) is
  'Sugiere posibles duplicados sin exponer identidad, ubicacion exacta ni descripcion.';

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
