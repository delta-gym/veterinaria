// Schema SQLite. Equivale a supabase/migrations/0001 + 0002, sin RLS: la
// autorización se hace en el código (ver src/lib/auth/session.ts y cada action).

export const schemaSql = `
create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null default '',
  phone text,
  role text not null default 'client' check (role in ('client', 'staff', 'admin')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists sessions (
  token_hash text primary key,
  user_id text not null references users (id) on delete cascade,
  expires_at text not null
);
create index if not exists sessions_user_id_idx on sessions (user_id);

create table if not exists pets (
  id text primary key,
  owner_id text not null references users (id) on delete cascade,
  name text not null,
  species text not null check (species in ('perro', 'gato', 'otro')),
  breed text,
  birth_date text,
  weight_kg real,
  notes text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists pets_owner_id_idx on pets (owner_id);

create table if not exists services (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  price_clp integer,
  active integer not null default 1
);

create table if not exists appointments (
  id text primary key,
  pet_id text not null references pets (id) on delete cascade,
  owner_id text not null references users (id) on delete cascade,
  service_id text not null references services (id),
  starts_at text not null,
  ends_at text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'done')),
  notes text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  check (ends_at > starts_at)
);
create index if not exists appointments_owner_id_idx on appointments (owner_id);
create index if not exists appointments_pet_id_idx on appointments (pet_id);
create index if not exists appointments_starts_at_idx on appointments (starts_at);

create table if not exists vaccines (
  id text primary key,
  pet_id text not null references pets (id) on delete cascade,
  name text not null,
  applied_at text not null,
  next_due_at text,
  notes text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists vaccines_pet_id_idx on vaccines (pet_id);

create table if not exists medical_records (
  id text primary key,
  pet_id text not null references pets (id) on delete cascade,
  appointment_id text references appointments (id) on delete set null,
  record_type text not null check (record_type in ('consulta', 'examen', 'cirugia', 'otro')),
  description text not null,
  weight_kg real,
  file_url text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
create index if not exists medical_records_pet_id_idx on medical_records (pet_id);

create table if not exists business_hours (
  weekday integer primary key check (weekday between 0 and 6), -- 0 = domingo ... 6 = sábado
  opens_at text,
  closes_at text,
  is_closed integer not null default 0
);
`;

export const seedSql = `
insert or ignore into services (id, slug, name, description, duration_minutes, price_clp, active) values
  ('svc-consulta-general', 'consulta-general', 'Consulta general', 'Chequeo completo, diagnóstico y orientación de tratamiento.', 30, 18000, 1),
  ('svc-vacunacion', 'vacunacion', 'Vacunación', 'Plan de vacunas según edad y especie, con carné actualizado.', 20, 15000, 1),
  ('svc-peluqueria', 'peluqueria', 'Peluquería y baño', 'Baño, corte y desenredado, adaptado al tipo de pelaje.', 60, 20000, 1),
  ('svc-ecografia', 'ecografia', 'Ecografía', 'Estudio de imagen para diagnóstico interno detallado.', 45, 35000, 1),
  ('svc-cirugia-menor', 'cirugia-menor', 'Cirugía menor', 'Esterilización y procedimientos ambulatorios menores.', 90, null, 1);

insert or ignore into business_hours (weekday, opens_at, closes_at, is_closed) values
  (0, null, null, 1),
  (1, '09:00', '19:00', 0),
  (2, '09:00', '19:00', 0),
  (3, '09:00', '19:00', 0),
  (4, '09:00', '19:00', 0),
  (5, '09:00', '19:00', 0),
  (6, '09:30', '14:00', 0);
`;
