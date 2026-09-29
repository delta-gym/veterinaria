import Link from "next/link";
import { dayRangeISO, inDaysISO, formatDate, formatTime, statusLabels, statusStyles, whatsappLink } from "@/lib/format";
import { queryAll, queryOne } from "@/lib/db";
import type { AppointmentStatus } from "@/types/database.types";
import { StatusButtons } from "./citas/StatusButtons";

type AgendaRow = {
  id: string;
  pet_id: string;
  starts_at: string;
  status: AppointmentStatus;
  pet_name: string;
  service_name: string;
  owner_name: string | null;
  owner_phone: string | null;
};

type VaccineDue = {
  id: string;
  pet_id: string;
  pet_name: string;
  name: string;
  next_due_at: string;
  owner_name: string | null;
  owner_phone: string | null;
};

const count = (sql: string, ...params: string[]) => queryOne<{ n: number }>(sql, ...params)?.n ?? 0;

const agendaSelect = `select a.id, a.pet_id, a.starts_at, a.status, p.name as pet_name, s.name as service_name,
                              u.full_name as owner_name, u.phone as owner_phone
                         from appointments a
                         join pets p on p.id = a.pet_id
                         join services s on s.id = a.service_id
                         join users u on u.id = a.owner_id`;

export default async function AdminResumenPage() {
  const today = dayRangeISO(0);
  const tomorrow = dayRangeISO(1);
  const nowISO = new Date().toISOString();
  const todayDate = new Date().toISOString().slice(0, 10);
  const in30 = inDaysISO(30).slice(0, 10);

  const stats = [
    {
      label: "Citas hoy",
      value: count(
        "select count(*) n from appointments where starts_at >= ? and starts_at < ? and status != 'cancelled'",
        today.start,
        today.end
      ),
      href: "/admin/citas?f=hoy",
    },
    {
      label: "Por confirmar",
      value: count("select count(*) n from appointments where status = 'pending' and starts_at >= ?", nowISO),
      href: "/admin/citas?f=pendientes",
    },
    { label: "Pacientes", value: count("select count(*) n from pets"), href: "/admin/pacientes" },
    { label: "Clientes", value: count("select count(*) n from users where role = 'client'"), href: "/admin/clientes" },
  ];

  const hoy = queryAll<AgendaRow>(
    `${agendaSelect} where a.starts_at >= ? and a.starts_at < ? and a.status != 'cancelled' order by a.starts_at`,
    today.start,
    today.end
  );

  const porConfirmar = queryAll<AgendaRow>(
    `${agendaSelect} where a.status = 'pending' and a.starts_at >= ? order by a.starts_at limit 8`,
    nowISO
  );

  const proximas7 = count(
    "select count(*) n from appointments where status in ('pending','confirmed') and starts_at >= ? and starts_at < ?",
    tomorrow.start,
    inDaysISO(8)
  );

  // Última dosis de cada vacuna que vence en los próximos 30 días (o ya venció).
  const vacunas = queryAll<VaccineDue>(
    `select v.id, v.pet_id, p.name as pet_name, v.name, v.next_due_at, u.full_name as owner_name, u.phone as owner_phone
       from vaccines v
       join pets p on p.id = v.pet_id
       join users u on u.id = p.owner_id
      where v.next_due_at is not null and v.next_due_at <= ?
        and not exists (select 1 from vaccines v2
                         where v2.pet_id = v.pet_id and v2.name = v.name and v2.applied_at > v.applied_at)
      order by v.next_due_at limit 10`,
    in30
  );

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Resumen</h1>
      <p className="mt-1 text-brand-900/70">
        {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
        {" · "}
        {proximas7} {proximas7 === 1 ? "cita" : "citas"} en los próximos 7 días
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-brand-900/60">{s.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-brand-900">Agenda de hoy</h2>
        {hoy.length === 0 ? (
          <p className="mt-3 text-sm text-brand-900/50">No hay citas para hoy.</p>
        ) : (
          <ul className="mt-3 divide-y divide-brand-50">
            {hoy.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="w-14 font-semibold text-brand-800">{formatTime(a.starts_at)}</span>
                  <div>
                    <Link href={`/admin/pacientes/${a.pet_id}`} className="font-medium hover:underline">
                      {a.pet_name}
                    </Link>
                    <span className="text-brand-900/60"> · {a.service_name}</span>
                    <div className="text-xs text-brand-900/50">{a.owner_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[a.status]}`}>
                    {statusLabels[a.status]}
                  </span>
                  <StatusButtons appointmentId={a.id} current={a.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Por confirmar</h2>
            <Link href="/admin/citas?f=pendientes" className="text-xs font-medium text-brand-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {porConfirmar.length === 0 ? (
            <p className="mt-3 text-sm text-brand-900/50">Todo al día.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {porConfirmar.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">
                      {a.pet_name} <span className="font-normal text-brand-900/60">· {a.service_name}</span>
                    </div>
                    <div className="text-xs text-brand-900/50">
                      {formatDate(a.starts_at)} {formatTime(a.starts_at)}
                    </div>
                  </div>
                  <StatusButtons appointmentId={a.id} current={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-brand-900">Vacunas por vencer (30 días)</h2>
          {vacunas.length === 0 ? (
            <p className="mt-3 text-sm text-brand-900/50">Ninguna vacuna próxima a vencer.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {vacunas.map((v) => {
                const vencida = v.next_due_at < todayDate;
                const wa = whatsappLink(
                  v.owner_phone,
                  `Hola ${v.owner_name ?? ""}, te recordamos que la vacuna ${v.name} de ${v.pet_name} ${
                    vencida ? "está vencida" : `vence el ${formatDate(v.next_due_at)}`
                  }. ¿Agendamos una hora?`
                );
                return (
                  <li key={v.id} className="flex items-center justify-between gap-2">
                    <div>
                      <Link href={`/admin/pacientes/${v.pet_id}`} className="font-medium hover:underline">
                        {v.pet_name}
                      </Link>
                      <span className="text-brand-900/60"> · {v.name}</span>
                      <div className={`text-xs ${vencida ? "font-medium text-red-700" : "text-brand-900/50"}`}>
                        {vencida ? "Vencida el " : "Vence el "}
                        {formatDate(v.next_due_at)}
                      </div>
                    </div>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-full border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        Avisar
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
