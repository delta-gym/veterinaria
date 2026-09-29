import Link from "next/link";
import { formatDate, formatDateTime } from "@/lib/format";
import { queryAll } from "@/lib/db";

const speciesEmoji: Record<string, string> = { perro: "🐶", gato: "🐱", otro: "🐾" };

type Row = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  ultima_atencion: string | null;
  proxima_cita: string | null;
  vacunas_vencidas: number;
};

export default async function AdminPacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const term = `%${q.trim()}%`;

  const rows = queryAll<Row>(
    `select p.id, p.name, p.species, p.breed, u.full_name as owner_name, u.phone as owner_phone,
            (select max(m.created_at) from medical_records m where m.pet_id = p.id) as ultima_atencion,
            (select min(a.starts_at) from appointments a
              where a.pet_id = p.id and a.status in ('pending', 'confirmed') and a.starts_at >= ?) as proxima_cita,
            (select count(*) from vaccines v
              where v.pet_id = p.id and v.next_due_at is not null and v.next_due_at < ?
                and not exists (select 1 from vaccines v2
                                 where v2.pet_id = v.pet_id and v2.name = v.name and v2.applied_at > v.applied_at)
            ) as vacunas_vencidas
       from pets p join users u on u.id = p.owner_id
      where p.name like ? or u.full_name like ? or u.email like ?
      order by p.name`,
    new Date().toISOString(),
    new Date().toISOString().slice(0, 10),
    term,
    term,
    term
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Pacientes</h1>
      <p className="mt-1 text-brand-900/70">Todas las mascotas registradas. Entra a una para cargar vacunas y atenciones.</p>

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por mascota, dueño o correo"
          className="w-full max-w-sm rounded-xl border border-brand-200 px-4 py-2.5 text-sm"
        />
        <button className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Buscar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50/60 text-xs uppercase tracking-wide text-brand-900/60">
            <tr>
              <th className="px-4 py-3">Mascota</th>
              <th className="px-4 py-3">Dueño</th>
              <th className="px-4 py-3">Última atención</th>
              <th className="px-4 py-3">Próxima cita</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-900/50">
                  No hay pacientes que coincidan.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-brand-50 last:border-0">
                <td className="px-4 py-3">
                  <span className="mr-2">{speciesEmoji[row.species]}</span>
                  <span className="font-medium">{row.name}</span>
                  <span className="ml-2 text-xs text-brand-900/50">{row.breed ?? row.species}</span>
                  {row.vacunas_vencidas > 0 && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      {row.vacunas_vencidas} {row.vacunas_vencidas === 1 ? "vacuna vencida" : "vacunas vencidas"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{row.owner_name || "—"}</div>
                  {row.owner_phone && <div className="text-xs text-brand-900/50">{row.owner_phone}</div>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.ultima_atencion ? formatDate(row.ultima_atencion) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.proxima_cita ? formatDateTime(row.proxima_cita) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pacientes/${row.id}`} className="font-medium text-brand-700 hover:underline">
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
