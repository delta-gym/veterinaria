import { queryAll, queryOne } from "@/lib/db";

const STEP_MINUTES = 30;

export type Slot = { startISO: string; label: string };

type Hours = { opens_at: string | null; closes_at: string | null; is_closed: number };

// Horarios libres de un día para un servicio. Usa la hora local del servidor
// (configúrala con la zona de la clínica al desplegar: TZ=America/Santiago).
export function computeAvailableSlots(date: string, serviceId: string): Slot[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

  const weekday = new Date(`${date}T12:00:00`).getDay();
  const hours = queryOne<Hours>(
    "select opens_at, closes_at, is_closed from business_hours where weekday = ?",
    weekday
  );
  if (!hours || hours.is_closed || !hours.opens_at || !hours.closes_at) return [];

  const service = queryOne<{ duration_minutes: number }>(
    "select duration_minutes from services where id = ? and active = 1",
    serviceId
  );
  if (!service) return [];

  const dayStart = new Date(`${date}T${hours.opens_at}:00`);
  const dayEnd = new Date(`${date}T${hours.closes_at}:00`);
  const durationMs = service.duration_minutes * 60_000;

  const busy = queryAll<{ starts_at: string; ends_at: string }>(
    `select starts_at, ends_at from appointments
      where status in ('pending', 'confirmed') and starts_at < ? and ends_at > ?`,
    dayEnd.toISOString(),
    dayStart.toISOString()
  ).map((a) => ({ start: Date.parse(a.starts_at), end: Date.parse(a.ends_at) }));

  const now = Date.now();
  const slots: Slot[] = [];

  for (let t = dayStart.getTime(); t + durationMs <= dayEnd.getTime(); t += STEP_MINUTES * 60_000) {
    const overlaps = busy.some((b) => t < b.end && t + durationMs > b.start);
    if (t <= now || overlaps) continue;

    const start = new Date(t);
    slots.push({
      startISO: start.toISOString(),
      label: start.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  return slots;
}
