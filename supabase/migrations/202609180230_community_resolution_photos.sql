-- Permite leer fotografías de resolución publicadas en el muro y
-- expone la ruta de Storage cuando image_url quedó vacío.

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
    coalesce(incidents.resolution_image_path, incidents.resolution_image_url),
    incidents.resolved_at,
    incidents.published_at
  from public.incidents
  where incidents.is_public = true
    and incidents.status = 'Resuelto'
    and incidents.discarded_at is null
    and incidents.published_at >= now() - interval '30 days'
  order by incidents.published_at desc;
$$;

drop policy if exists "Authenticated read published resolution photos" on storage.objects;

create policy "Authenticated read published resolution photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'incident-photos'
    and exists (
      select 1
      from public.incidents
      where incidents.resolution_image_path = name
        and incidents.is_public = true
        and incidents.status = 'Resuelto'
        and incidents.discarded_at is null
    )
  );
