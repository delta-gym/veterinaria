// Tipos de las filas de la base SQLite (ver src/lib/db/schema.ts).

export type ProfileRole = "client" | "staff" | "admin";
export type PetSpecies = "perro" | "gato" | "otro";
export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "done";
export type RecordType = "consulta" | "examen" | "cirugia" | "otro";

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number | null;
  notes: string | null;
  created_at: string;
};

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_clp: number | null;
  active: number; // 1 = activo, 0 = oculto
};

export type Appointment = {
  id: string;
  pet_id: string;
  owner_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
};

export type Vaccine = {
  id: string;
  pet_id: string;
  name: string;
  applied_at: string;
  next_due_at: string | null;
  notes: string | null;
  created_at: string;
};

export type MedicalRecord = {
  id: string;
  pet_id: string;
  appointment_id: string | null;
  record_type: RecordType;
  description: string;
  weight_kg: number | null;
  file_url: string | null;
  created_at: string;
};
