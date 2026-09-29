"use server";

import { revalidatePath } from "next/cache";
import { getStaffUser } from "@/lib/auth/session";
import { run } from "@/lib/db";
import type { AppointmentStatus } from "@/types/database.types";

const validStatuses: AppointmentStatus[] = ["pending", "confirmed", "cancelled", "done"];

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  if (!(await getStaffUser()) || !validStatuses.includes(status)) return;

  run("update appointments set status = ? where id = ?", status, appointmentId);
  revalidatePath("/admin", "layout");
  revalidatePath("/mis-mascotas");
}
