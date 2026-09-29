import Link from "next/link";
import { dayRangeISO, formatDateTime, statusLabels, statusStyles, whatsappLink } from "@/lib/format";
import { queryAll } from "@/lib/db";
import type { AppointmentStatus } from "@/types/database.types";
import { StatusButtons } from "./StatusButtons";

type Row = {
  id: string;
  pet_id: string;
  starts_at: string;
  status: AppointmentStatus;
  pet_name: string | null;
  service_name: string | null;
  owner_name: string | null;
  owner_phone: string | null;
};

const filters = [
  { key: "proximas", label: "Próximas" },
  { key: "hoy", label: "Hoy" },
  { key: "pendientes", label: "Por confirmar" },
  { key: "pasadas", label: "Pasadas" },
  { key: "todas", label: "Todas" },
] as const;

export default async function AdminCitasPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const filter = filters.find((x) => x.key === f)?.key ?? "proximas";

  const today = dayRangeISO(0);
  const nowISO = new Date().toISOString();

  const where: Record<typeof filter, { sql: string; params: string[]; order: string }> = {
    proximas: { sql: "a.starts_at >= ? and a.status != 'cancelled'", params: [today.start], order: "asc" },
    hoy: { sql: "a.starts_at >= ? and a.starts_at < ?", params: [today.start, today.end], order: "asc" },
    pendientes: { sql: "a.status = 'pending' and a.starts_at >= ?", params: [nowISO], order: "asc" },
    pasadas: { sql: "a.starts_at < ?", params: [today.start], order: "desc" },
    todas: { sql: "1 = 1", params: [], order: "desc" },
  };
  const w = where[filter];

  const rows = queryAll<Row>(
    `select a.id, a.pet_id, a.starts_at, a.status,
            p.name as pet_name, s.name as service_name,
            u.full_name as owner_name, u.phone as owner_phone
       from appointments a
       left join pets p on p.id = a.pet_id
       left join services s on s.id = a.service_id
       left join users u on u.id = a.owner_id
      where ${w.sql}
      order by a.starts_at ${w.order}`,
    ...w.params
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Citas</h1>
      <p className="mt-1 text-brand-900/70">Toda la agenda de la clínica en un solo lugar.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((x) => (
          <Link
            key={x.key}
            href={`/admin/citas?f=${x.key}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === x.key
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
            }`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50/60 text-xs uppercase tracking-wide text-brand-900/60">
            <tr>
              <th className="px-4 py-3">Fecha y hora</th>
              <th className="px-4 py-3">Mascota</th>
              <th className="px-4 py-3">Dueño</th>
              <th className="px-4 py-3">Servicio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-900/50">
                  No hay citas en esta vista.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const wa = whatsappLink(row.owner_phone);
              return (
                <tr key={row.id} className="border-b border-brand-50 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{formatDateTime(row.starts_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pacientes/${row.pet_id}`} className="font-medium hover:underline">
                      {row.pet_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{row.owner_name || "—"}</div>
                    {row.owner_phone && (
                      <div className="text-xs text-brand-900/50">
                        {wa ? (
                          <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {row.owner_phone}
                          </a>
                        ) : (
                          row.owner_phone
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">{row.service_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[row.status]}`}>
                      {statusLabels[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusButtons appointmentId={row.id} current={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
