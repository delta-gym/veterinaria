import Link from "next/link";
import { notFound } from "next/navigation";
import { queryAll, queryOne } from "@/lib/db";
import type { AppointmentStatus, MedicalRecord, Pet, Vaccine } from "@/types/database.types";
import { formatDate, formatDateTime, statusLabels, statusStyles, whatsappLink } from "@/lib/format";
import { addMedicalRecord, addVaccine, updatePetNotes } from "./actions";

const input = "rounded-xl border border-brand-200 px-4 py-2.5 text-sm";
const button = "rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700";

export default async function PacienteFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const pet = queryOne<Pet & { owner_name: string | null; owner_phone: string | null; owner_email: string }>(
    `select p.*, u.full_name as owner_name, u.phone as owner_phone, u.email as owner_email
       from pets p join users u on u.id = p.owner_id where p.id = ?`,
    id
  );
  if (!pet) notFound();

  const vaccines = queryAll<Vaccine>("select * from vaccines where pet_id = ? order by applied_at desc", id);
  const records = queryAll<MedicalRecord>("select * from medical_records where pet_id = ? order by created_at desc", id);
  const citas = queryAll<{ id: string; starts_at: string; status: AppointmentStatus; service_name: string }>(
    `select a.id, a.starts_at, a.status, s.name as service_name
       from appointments a join services s on s.id = a.service_id
      where a.pet_id = ? order by a.starts_at desc limit 15`,
    id
  );
  const wa = whatsappLink(pet.owner_phone);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/admin/pacientes" className="text-sm font-medium text-brand-700 hover:underline">
        ← Pacientes
      </Link>

      <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-brand-900">{pet.name}</h1>
        <p className="mt-1 text-sm text-brand-900/70">
          {pet.breed ?? pet.species}
          {pet.birth_date && ` · Nació ${formatDate(pet.birth_date)}`}
          {pet.weight_kg && ` · ${pet.weight_kg} kg`}
        </p>
        <p className="mt-2 text-sm text-brand-900/70">
          Dueño: <span className="font-medium text-brand-900">{pet.owner_name || pet.owner_email}</span>
          {pet.owner_phone && ` · ${pet.owner_phone}`}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="ml-2 font-medium text-brand-700 hover:underline">
              WhatsApp
            </a>
          )}
        </p>
        <form action={updatePetNotes} className="mt-4 grid gap-2">
          <input type="hidden" name="pet_id" value={pet.id} />
          <label className="text-xs font-semibold uppercase tracking-wide text-brand-900/50" htmlFor="notes">
            Notas clínicas (alergias, temperamento, condiciones)
          </label>
          <textarea id="notes" name="notes" rows={2} defaultValue={pet.notes ?? ""} className={input} />
          <button className="justify-self-start rounded-full border border-brand-300 px-4 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Guardar notas
          </button>
        </form>
      </div>

      <section className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-brand-900">Citas</h2>
        <ul className="mt-3 divide-y divide-brand-50 text-sm">
          {citas.length === 0 && <li className="py-2 text-brand-900/50">Sin citas registradas.</li>}
          {citas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                {formatDateTime(c.starts_at)} <span className="text-brand-900/60">· {c.service_name}</span>
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[c.status]}`}>
                {statusLabels[c.status]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-brand-900">Vacunas</h2>
          <ul className="mt-3 space-y-1 text-sm">
            {vaccines.length === 0 && <li className="text-brand-900/50">Sin registros aún.</li>}
            {vaccines.map((v) => (
              <li key={v.id} className="flex justify-between gap-3">
                <span>{v.name}</span>
                <span className="text-right text-brand-900/60">
                  {formatDate(v.applied_at)}
                  {v.next_due_at && <span className="block text-xs">Próxima: {formatDate(v.next_due_at)}</span>}
                </span>
              </li>
            ))}
          </ul>

          <form action={addVaccine} className="mt-5 grid gap-2 border-t border-brand-100 pt-4">
            <input type="hidden" name="pet_id" value={pet.id} />
            <input name="name" placeholder="Vacuna (ej. Antirrábica)" required className={input} />
            <label className="text-xs text-brand-900/60">
              Aplicada
              <input name="applied_at" type="date" max={today} defaultValue={today} required className={`${input} mt-1 block w-full`} />
            </label>
            <label className="text-xs text-brand-900/60">
              Próxima dosis (opcional)
              <input name="next_due_at" type="date" className={`${input} mt-1 block w-full`} />
            </label>
            <button className={button}>Registrar vacuna</button>
          </form>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-brand-900">Historial de atenciones</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {records.length === 0 && <li className="text-brand-900/50">Sin registros aún.</li>}
            {records.map((r) => (
              <li key={r.id}>
                <span className="font-medium capitalize">{r.record_type}</span>
                <span className="text-xs text-brand-900/50"> · {formatDate(r.created_at)}</span>
                {r.weight_kg && <span className="text-xs text-brand-900/50"> · {r.weight_kg} kg</span>}
                <p className="text-brand-900/70">{r.description}</p>
              </li>
            ))}
          </ul>

          <form action={addMedicalRecord} className="mt-5 grid gap-2 border-t border-brand-100 pt-4">
            <input type="hidden" name="pet_id" value={pet.id} />
            <select name="record_type" className={input}>
              <option value="consulta">Consulta</option>
              <option value="examen">Examen</option>
              <option value="cirugia">Cirugía</option>
              <option value="otro">Otro</option>
            </select>
            <textarea name="description" placeholder="Diagnóstico, tratamiento, observaciones" required rows={3} className={input} />
            <input name="weight_kg" type="number" step="0.1" min="0" placeholder="Peso (kg, opcional)" className={input} />
            <button className={button}>Registrar atención</button>
          </form>
        </section>
      </div>
    </div>
  );
}
