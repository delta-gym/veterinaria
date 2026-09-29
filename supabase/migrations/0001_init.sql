-- =============================================================================
-- Veterinaria — schema inicial
-- Ejecuta este archivo completo en Supabase (SQL Editor, o `supabase db push`
-- si trabajas con la CLI). Ver README.md, Paso 3.
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists btree_gist;   -- exclude constraint de la agenda

-- -----------------------------------------------------------------------------
-- profiles: un perfil por usuario autenticado (dueño de mascota o staff)
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'client' check (role in ('client', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

comment on table profiles is 'Un registro por usuario de auth.users. role=client (dueño) o staff/admin (equipo clínica).';

-- Crea el profile automáticamente cuando alguien se registra vía Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- pets: mascotas de cada dueño
-- -----------------------------------------------------------------------------
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  species text not null check (species in ('perro', 'gato', 'otro')),
  breed text,
  birth_date date,
  weight_kg numeric(5, 2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists pets_owner_id_idx on pets (owner_id);

-- -----------------------------------------------------------------------------
-- services: catálogo de servicios (consulta, peluquería, ecografía, etc.)
-- -----------------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  duration_minutes int not null default 30 check (duration_minutes > 0),
  price_clp numeric(10, 0),
  active boolean not null default true
);

-- -----------------------------------------------------------------------------
-- appointments: agenda. El `exclude` impide dos citas en horarios traslapados.
-- -----------------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  owner_id uuid not null references profiles (id) on delete cascade,
  service_id uuid not null references services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'done')),
  notes text,
  created_at timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at),
  -- Si en el futuro hay varios profesionales en paralelo, agrega una columna
  -- staff_id y súmala al `exclude` (with staff_id with =) para permitir
  -- horarios simultáneos en distintos profesionales.
  exclude using gist (
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'confirmed'))
);

create index if not exists appointments_owner_id_idx on appointments (owner_id);
create index if not exists appointments_pet_id_idx on appointments (pet_id);
create index if not exists appointments_starts_at_idx on appointments (starts_at);

-- -----------------------------------------------------------------------------
-- vaccines: registro de vacunas por mascota
-- -----------------------------------------------------------------------------
create table if not exists vaccines (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  name text not null,
  applied_at date not null,
  next_due_at date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists vaccines_pet_id_idx on vaccines (pet_id);

-- -----------------------------------------------------------------------------
-- medical_records: historial de atenciones/exámenes (la "ficha" de la mascota)
-- -----------------------------------------------------------------------------
create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets (id) on delete cascade,
  appointment_id uuid references appointments (id) on delete set null,
  record_type text not null check (record_type in ('consulta', 'examen', 'cirugia', 'otro')),
  description text not null,
  weight_kg numeric(5, 2),
  file_url text,
  created_at timestamptz not null default now()
);

create index if not exists medical_records_pet_id_idx on medical_records (pet_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table profiles enable row level security;
alter table pets enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;
alter table vaccines enable row level security;
alter table medical_records enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
security invoker
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- profiles
create policy "profiles_select_own_or_staff" on profiles
  for select to authenticated
  using (id = auth.uid() or is_staff());

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- pets
create policy "pets_select_own_or_staff" on pets
  for select to authenticated
  using (owner_id = auth.uid() or is_staff());

create policy "pets_insert_own_or_staff" on pets
  for insert to authenticated
  with check (owner_id = auth.uid() or is_staff());

create policy "pets_update_own_or_staff" on pets
  for update to authenticated
  using (owner_id = auth.uid() or is_staff())
  with check (owner_id = auth.uid() or is_staff());

-- services (catálogo público de lectura, para mostrarlo sin login en la landing)
create policy "services_select_public" on services
  for select to anon, authenticated
  using (active);

create policy "services_write_staff" on services
  for all to authenticated
  using (is_staff())
  with check (is_staff());

-- appointments
create policy "appointments_select_own_or_staff" on appointments
  for select to authenticated
  using (owner_id = auth.uid() or is_staff());

create policy "appointments_insert_own_or_staff" on appointments
  for insert to authenticated
  with check (owner_id = auth.uid() or is_staff());

create policy "appointments_update_own_or_staff" on appointments
  for update to authenticated
  using (owner_id = auth.uid() or is_staff())
  with check (owner_id = auth.uid() or is_staff());

-- vaccines
create policy "vaccines_select_owner_or_staff" on vaccines
  for select to authenticated
  using (exists (
    select 1 from pets p where p.id = pet_id and (p.owner_id = auth.uid() or is_staff())
  ));

create policy "vaccines_write_staff" on vaccines
  for all to authenticated
  using (is_staff())
  with check (is_staff());

-- medical_records
create policy "records_select_owner_or_staff" on medical_records
  for select to authenticated
  using (exists (
    select 1 from pets p where p.id = pet_id and (p.owner_id = auth.uid() or is_staff())
  ));

create policy "records_write_staff" on medical_records
  for all to authenticated
  using (is_staff())
  with check (is_staff());

-- =============================================================================
-- SEED: servicios de ejemplo (edítalos o bórralos y usa el panel staff)
-- =============================================================================
insert into services (slug, name, description, duration_minutes, price_clp)
values
  ('consulta-general', 'Consulta general', 'Chequeo completo, diagnóstico y orientación de tratamiento.', 30, 18000),
  ('vacunacion', 'Vacunación', 'Plan de vacunas según edad y especie, con carné actualizado.', 20, 15000),
  ('peluqueria', 'Peluquería y baño', 'Baño, corte y desenredado, adaptado al tipo de pelaje.', 60, 20000),
  ('ecografia', 'Ecografía', 'Estudio de imagen para diagnóstico interno detallado.', 45, 35000),
  ('cirugia-menor', 'Cirugía menor', 'Esterilización y procedimientos ambulatorios menores.', 90, null)
on conflict (slug) do nothing;
