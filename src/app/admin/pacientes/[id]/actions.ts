"use server";

import { revalidatePath } from "next/cache";
import { getStaffUser, newId } from "@/lib/auth/session";
import { queryOne, run } from "@/lib/db";

const recordTypes = ["consulta", "examen", "cirugia", "otro"];
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

async function staffPetId(formData: FormData) {
  if (!(await getStaffUser())) return null;
  const petId = String(formData.get("pet_id") ?? "");
  return queryOne("select 1 from pets where id = ?", petId) ? petId : null;
}

export async function addVaccine(formData: FormData) {
  const petId = await staffPetId(formData);
  const name = String(formData.get("name") ?? "").trim();
  const appliedAt = String(formData.get("applied_at") ?? "");
  const nextDue = String(formData.get("next_due_at") ?? "");
  if (!petId || !name || !isDate(appliedAt) || (nextDue && !isDate(nextDue))) return;

  run(
    "insert into vaccines (id, pet_id, name, applied_at, next_due_at) values (?, ?, ?, ?, ?)",
    newId(),
    petId,
    name,
    appliedAt,
    nextDue || null
  );
  revalidatePath(`/admin/pacientes/${petId}`);
  revalidatePath("/mis-mascotas");
}

export async function addMedicalRecord(formData: FormData) {
  const petId = await staffPetId(formData);
  const recordType = String(formData.get("record_type") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const weight = String(formData.get("weight_kg") ?? "");
  if (!petId || !description || !recordTypes.includes(recordType)) return;

  run(
    "insert into medical_records (id, pet_id, record_type, description, weight_kg) values (?, ?, ?, ?, ?)",
    newId(),
    petId,
    recordType,
    description,
    weight ? Number(weight) : null
  );
  // Si se informó un peso, se actualiza también en la ficha de la mascota.
  if (weight) run("update pets set weight_kg = ? where id = ?", Number(weight), petId);

  revalidatePath(`/admin/pacientes/${petId}`);
  revalidatePath("/mis-mascotas");
}

export async function updatePetNotes(formData: FormData) {
  const petId = await staffPetId(formData);
  if (!petId) return;

  run("update pets set notes = ? where id = ?", String(formData.get("notes") ?? "").trim() || null, petId);
  revalidatePath(`/admin/pacientes/${petId}`);
}
