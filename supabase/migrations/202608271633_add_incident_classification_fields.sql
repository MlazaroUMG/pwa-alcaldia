alter table public.incidents
  add column if not exists dependency text,
  add column if not exists call_type_code integer,
  add column if not exists call_type_label text;

comment on column public.incidents.dependency is
  'Dependencia municipal o institucional responsable de atender la incidencia.';

comment on column public.incidents.call_type_code is
  'Codigo operativo del tipo de llamada seleccionado para clasificar la incidencia.';

comment on column public.incidents.call_type_label is
  'Etiqueta descriptiva del tipo de llamada seleccionado para consulta administrativa.';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'incidents_dependency_check'
      and conrelid = 'public.incidents'::regclass
  ) then
    alter table public.incidents
      add constraint incidents_dependency_check
      check (
        dependency is null
        or dependency in (
          'Regencia Norte - Servicios',
          'Empagua - Distribución',
          'Empagua - Sistemas Drenajes'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'incidents_call_type_dependency_check'
      and conrelid = 'public.incidents'::regclass
  ) then
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
            or (call_type_code = 509 and call_type_label = 'LIMPIEZA DE CUNETAS (REGENCIA NORTE)')
            or (call_type_code = 510 and call_type_label = 'LIMPIEZA DE BASUREROS CLANDESTINOS')
            or (call_type_code = 511 and call_type_label = 'LIMPIEZA DE TRAGANTES (REGENCIA NORTE)')
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
  end if;
end $$;
