export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (d: string) =>
  new Date(d).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });

export const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

export const formatPrice = (clp: number | null) =>
  clp === null ? "A consultar" : new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(clp);

// Enlace de WhatsApp a partir de un teléfono chileno (9 dígitos móvil o con 56).
export function whatsappLink(phone: string | null, text?: string) {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 9) digits = `56${digits}`;
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

// Inicio del día local y del siguiente, en ISO (para comparar con starts_at).
export function dayRangeISO(offsetDays = 0) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand-100 text-brand-800",
  done: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-700",
} as const;

export const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  done: "Atendida",
  cancelled: "Cancelada",
} as const;

// Fecha/hora ISO dentro de `days` días a partir de ahora.
export const inDaysISO = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
