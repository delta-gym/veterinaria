import { requireUser } from "@/lib/auth/session";
import { queryAll } from "@/lib/db";
import type { MedicalRecord, Pet, Vaccine } from "@/types/database.types";
import { AddPetForm } from "./AddPetForm";

const speciesEmoji: Record<string, string> = { perro: "🐶", gato: "🐱", otro: "🐾" };

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function MisMascotasPage() {
  const user = await requireUser("/mis-mascotas");

  const pets = queryAll<Pet>("select * from pets where owner_id = ? order by created_at desc", user.id);

  const petIds = pets.map((p) => p.id);
  const marks = petIds.map(() => "?").join(", ");

  const vaccines = petIds.length
    ? queryAll<Vaccine>(`select * from vaccines where pet_id in (${marks}) order by applied_at desc`, ...petIds)
    : [];
  const records = petIds.length
    ? queryAll<MedicalRecord>(
        `select * from medical_records where pet_id in (${marks}) order by created_at desc`,
        ...petIds
      )
    : [];
  const appointments = petIds.length
    ? queryAll<{ id: string; pet_id: string; starts_at: string; status: string; service_name: string | null }>(
        `select a.id, a.pet_id, a.starts_at, a.status, s.name as service_name
           from appointments a left join services s on s.id = a.service_id
          where a.pet_id in (${marks}) and a.starts_at >= ? and a.status in ('pending', 'confirmed')
          order by a.starts_at`,
        ...petIds,
        new Date().toISOString()
      )
    : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-2xl font-bold text-brand-900">Mis mascotas</h1>
      <p className="mt-1 text-brand-900/70">
        Historial de atenciones, vacunas y peso de cada una de tus mascotas.
      </p>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-brand-900">Agregar una mascota nueva</h2>
        <AddPetForm />
      </div>

      <div className="mt-8 space-y-6">
        {pets.length === 0 && (
          <p className="text-brand-900/60">Aún no tienes mascotas registradas.</p>
        )}

        {pets.map((pet) => {
          const petVaccines = vaccines.filter((v) => v.pet_id === pet.id);
          const petRecords = records.filter((r) => r.pet_id === pet.id);
          const petAppointments = appointments.filter((a) => a.pet_id === pet.id);

          return (
            <article key={pet.id} className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{speciesEmoji[pet.species]}</span>
                  <div>
                    <h3 className="font-semibold text-brand-900">{pet.name}</h3>
                    <p className="text-xs text-brand-900/60">
                      {pet.breed ?? pet.species} · Nació {formatDate(pet.birth_date)}
                    </p>
                  </div>
                </div>
                {pet.weight_kg && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
                    {pet.weight_kg} kg
                  </span>
                )}
              </div>

              {petAppointments.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                    Próximas citas
                  </p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {petAppointments.map((a) => (
                      <li key={a.id} className="flex justify-between">
                        <span>{a.service_name ?? "Servicio"}</span>
                        <span className="text-brand-900/60">
                          {new Date(a.starts_at).toLocaleString("es-CL", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                    Vacunas
                  </p>
                  {petVaccines.length === 0 ? (
                    <p className="mt-1 text-sm text-brand-900/50">Sin registros aún.</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-sm">
                      {petVaccines.map((v) => (
                        <li key={v.id} className="flex justify-between">
                          <span>{v.name}</span>
                          <span className="text-brand-900/60">{formatDate(v.applied_at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                    Historial de atenciones
                  </p>
                  {petRecords.length === 0 ? (
                    <p className="mt-1 text-sm text-brand-900/50">Sin registros aún.</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-sm">
                      {petRecords.map((r) => (
                        <li key={r.id}>
                          <span className="font-medium capitalize">{r.record_type}</span>
                          <span className="text-brand-900/60"> — {r.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
