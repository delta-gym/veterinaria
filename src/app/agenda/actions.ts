"use server";

import { revalidatePath } from "next/cache";
import { computeAvailableSlots, type Slot } from "@/lib/agenda";
import { getCurrentUser, newId } from "@/lib/auth/session";
import { queryOne, run, transaction } from "@/lib/db";

export async function getAvailableSlots(date: string, serviceId: string): Promise<Slot[]> {
  if (!date || !serviceId) return [];
  return computeAvailableSlots(date, serviceId);
}

export type BookState = { error: string | null; success: boolean };

class SlotTakenError extends Error {}

export async function bookAppointment(_prev: BookState, formData: FormData): Promise<BookState> {
  const petId = String(formData.get("pet_id") ?? "");
  const serviceId = String(formData.get("service_id") ?? "");
  const startISO = String(formData.get("start_iso") ?? "");

  if (!petId || !serviceId || !startISO) {
    return { error: "Completa mascota, servicio y horario.", success: false };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Debes iniciar sesión para agendar.", success: false };
  }

  const service = queryOne<{ duration_minutes: number }>(
    "select duration_minutes from services where id = ? and active = 1",
    serviceId
  );
  if (!service) {
    return { error: "El servicio ya no está disponible.", success: false };
  }

  if (!queryOne("select 1 from pets where id = ? and owner_id = ?", petId, user.id)) {
    return { error: "Esa mascota no es tuya.", success: false };
  }

  const startsAt = new Date(startISO);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Horario inválido.", success: false };
  }
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);

  try {
    // Dentro de la transacción se vuelve a verificar que el horario siga libre
    // (dentro del horario de atención y sin traslape con otra cita).
    transaction(() => {
      const date = `${startsAt.getFullYear()}-${String(startsAt.getMonth() + 1).padStart(2, "0")}-${String(
        startsAt.getDate()
      ).padStart(2, "0")}`;
      const stillFree = computeAvailableSlots(date, serviceId).some((s) => s.startISO === startsAt.toISOString());
      if (!stillFree) throw new SlotTakenError();

      run(
        `insert into appointments (id, pet_id, owner_id, service_id, starts_at, ends_at)
         values (?, ?, ?, ?, ?, ?)`,
        newId(),
        petId,
        user.id,
        serviceId,
        startsAt.toISOString(),
        endsAt.toISOString()
      );
    });
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return { error: "Ese horario ya no está disponible. Elige otro, por favor.", success: false };
    }
    return { error: "No se pudo agendar la hora. Intenta de nuevo.", success: false };
  }

  revalidatePath("/mis-mascotas");
  return { error: null, success: true };
}
