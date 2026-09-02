alter table public.incidents
  add column if not exists resolution_image_url text;

comment on column public.incidents.resolution_image_url is
  'URL de la fotografia de resolucion cargada por el personal administrativo al cerrar la incidencia.';
