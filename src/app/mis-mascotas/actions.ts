"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { run } from "@/lib/db";

export type PetFormState = { error: string | null };

const validSpecies = ["perro", "gato", "otro"];

export async function addPet(_prev: PetFormState, formData: FormData): Promise<PetFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const species = String(formData.get("species") ?? "perro");
  const breed = String(formData.get("breed") ?? "").trim() || null;
  const birthDate = String(formData.get("birth_date") ?? "") || null;
  const weight = formData.get("weight_kg");

  if (!name) {
    return { error: "El nombre de la mascota es obligatorio." };
  }
  if (!validSpecies.includes(species)) {
    return { error: "Especie inválida." };
  }

  if (birthDate && (Number.isNaN(Date.parse(birthDate)) || birthDate > new Date().toISOString().slice(0, 10))) {
    return { error: "La fecha de nacimiento no puede ser futura." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debes iniciar sesión." };
  }

  try {
    run(
      `insert into pets (id, owner_id, name, species, breed, birth_date, weight_kg)
       values (?, ?, ?, ?, ?, ?, ?)`,
      newId(),
      user.id,
      name,
      species,
      breed,
      birthDate,
      weight ? Number(weight) : null
    );
  } catch {
    return { error: "No se pudo guardar la mascota. Intenta de nuevo." };
  }

  revalidatePath("/mis-mascotas");
  return { error: null };
}
