import { formatDate, whatsappLink } from "@/lib/format";
import { queryAll } from "@/lib/db";

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  pets: number;
  citas: number;
  ultima_cita: string | null;
};

export default async function AdminClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = `%${q.trim()}%`;

  const rows = queryAll<Row>(
    `select u.id, u.full_name, u.email, u.phone, u.role, u.created_at,
            (select count(*) from pets p where p.owner_id = u.id) as pets,
            (select count(*) from appointments a where a.owner_id = u.id and a.status != 'cancelled') as citas,
            (select max(a.starts_at) from appointments a where a.owner_id = u.id and a.status = 'done') as ultima_cita
       from users u
      where u.full_name like ? or u.email like ? or u.phone like ?
      order by u.created_at desc`,
    term,
    term,
    term
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Clientes</h1>
      <p className="mt-1 text-brand-900/70">Dueños registrados y su actividad en la clínica.</p>

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, correo o teléfono"
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
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contacto</th>
              <th className="px-4 py-3 text-center">Mascotas</th>
              <th className="px-4 py-3 text-center">Citas</th>
              <th className="px-4 py-3">Última atención</th>
              <th className="px-4 py-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-900/50">
                  No hay clientes que coincidan.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const wa = whatsappLink(r.phone);
              return (
                <tr key={r.id} className="border-b border-brand-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.full_name || "—"}</div>
                    {r.role !== "client" && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                        {r.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{r.email}</div>
                    {r.phone &&
                      (wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-700 hover:underline"
                        >
                          {r.phone} · WhatsApp
                        </a>
                      ) : (
                        <div className="text-xs text-brand-900/50">{r.phone}</div>
                      ))}
                  </td>
                  <td className="px-4 py-3 text-center">{r.pets}</td>
                  <td className="px-4 py-3 text-center">{r.citas}</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.ultima_cita ? formatDate(r.ultima_cita) : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-900/60">{formatDate(r.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
