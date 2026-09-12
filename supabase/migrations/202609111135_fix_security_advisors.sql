-- Corrige hallazgos del Advisor sin volver a exponer la tabla incidents.

drop view if exists public.community_board_public;

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
    and incidents.published_at >= now() - interval '30 days'
  order by incidents.published_at desc;
$$;

comment on function public.get_community_board() is
  'Retorna exclusivamente la proyeccion anonimizada del muro a usuarios autenticados.';

revoke all on function public.get_community_board() from public, anon;
grant execute on function public.get_community_board() to authenticated;

alter table private.duplicate_check_log
  add column if not exists id bigint generated always as identity;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'private.duplicate_check_log'::regclass
      and contype = 'p'
  ) then
    alter table private.duplicate_check_log
      add constraint duplicate_check_log_pkey primary key (id);
  end if;
end;
$$;
