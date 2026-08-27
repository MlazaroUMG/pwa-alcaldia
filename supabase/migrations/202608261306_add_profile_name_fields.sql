alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text;

comment on column public.profiles.first_name is
  'Nombre del ciudadano o usuario autenticado para mostrar en perfiles y trazabilidad administrativa.';

comment on column public.profiles.last_name is
  'Apellido del ciudadano o usuario autenticado para mostrar en perfiles y trazabilidad administrativa.';
