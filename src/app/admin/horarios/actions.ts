"use server";

import { revalidatePath } from "next/cache";
import { getStaffUser } from "@/lib/auth/session";
import { transaction, run } from "@/lib/db";

const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export async function saveBusinessHours(formData: FormData) {
  if (!(await getStaffUser())) return;

  const days = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
    weekday: d,
    closed: formData.has(`closed_${d}`),
    opens: String(formData.get(`opens_${d}`) ?? ""),
    closes: String(formData.get(`closes_${d}`) ?? ""),
  }));

  // Un día abierto necesita horas válidas y cierre posterior a la apertura.
  if (days.some((d) => !d.closed && (!isTime(d.opens) || !isTime(d.closes) || d.closes <= d.opens))) return;

  transaction(() => {
    for (const d of days) {
      run(
        "update business_hours set opens_at = ?, closes_at = ?, is_closed = ? where weekday = ?",
        d.closed ? null : d.opens,
        d.closed ? null : d.closes,
        d.closed ? 1 : 0,
        d.weekday
      );
    }
  });
  revalidatePath("/admin/horarios");
  revalidatePath("/agenda");
}
