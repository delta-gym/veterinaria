-- =============================================================================
-- Horario de atención + función de disponibilidad para la agenda online.
-- Separado en su propia migración para que sea fácil de editar sin tocar
-- el schema principal (0001_init.sql).
-- =============================================================================

create table if not exists business_hours (
  weekday int primary key check (weekday between 0 and 6), -- 0 = domingo ... 6 = sábado (extract(dow))
  opens_at time,
  closes_at time,
  is_closed boolean not null default false
);

alter table business_hours enable row level security;

create policy "business_hours_select_public" on business_hours
  for select to anon, authenticated
  using (true);

create policy "business_hours_write_staff" on business_hours
  for all to authenticated
  using (is_staff())
  with check (is_staff());

-- Lunes a viernes 09:00–19:00, sábado 09:30–14:00, domingo cerrado.
insert into business_hours (weekday, opens_at, closes_at, is_closed) values
  (0, null, null, true),
  (1, '09:00', '19:00', false),
  (2, '09:00', '19:00', false),
  (3, '09:00', '19:00', false),
  (4, '09:00', '19:00', false),
  (5, '09:00', '19:00', false),
  (6, '09:30', '14:00', false)
on conflict (weekday) do nothing;

-- -----------------------------------------------------------------------------
-- get_available_slots: calcula los horarios libres para un día y un servicio,
-- sin exponer las citas de otros clientes (solo devuelve horas, no filas).
-- Usa security definer porque necesita "ver" todas las citas del día para
-- descartar los horarios ocupados, aunque RLS restrinja `appointments` a cada
-- dueño; por eso NO expone appointment_id/owner_id, solo slot_start.
-- -----------------------------------------------------------------------------
create or replace function public.get_available_slots(p_date date, p_service_id uuid)
returns table (slot_start timestamptz)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_weekday int := extract(dow from p_date);
  v_opens time;
  v_closes time;
  v_is_closed boolean;
  v_duration int;
  v_step interval := interval '30 minutes';
  v_slot timestamptz;
  v_slot_end timestamptz;
  v_day_start timestamptz;
  v_day_end timestamptz;
begin
  select opens_at, closes_at, is_closed into v_opens, v_closes, v_is_closed
  from business_hours where weekday = v_weekday;

  if not found or v_is_closed or v_opens is null then
    return; -- día cerrado: sin horarios
  end if;

  select duration_minutes into v_duration from services where id = p_service_id and active;
  if not found then
    return; -- servicio inválido o inactivo
  end if;

  v_day_start := (p_date::text || ' ' || v_opens::text)::timestamptz;
  v_day_end := (p_date::text || ' ' || v_closes::text)::timestamptz;
  v_slot := v_day_start;

  while v_slot + (v_duration || ' minutes')::interval <= v_day_end loop
    v_slot_end := v_slot + (v_duration || ' minutes')::interval;

    if v_slot > now() and not exists (
      select 1 from appointments a
      where a.status in ('pending', 'confirmed')
        and tstzrange(a.starts_at, a.ends_at) && tstzrange(v_slot, v_slot_end)
    ) then
      slot_start := v_slot;
      return next;
    end if;

    v_slot := v_slot + v_step;
  end loop;

  return;
end;
$$;

-- Cualquier usuario autenticado puede consultar disponibilidad (no expone datos de otros)
revoke all on function public.get_available_slots(date, uuid) from public;
grant execute on function public.get_available_slots(date, uuid) to authenticated;
