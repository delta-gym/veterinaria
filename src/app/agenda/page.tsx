import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { queryAll } from "@/lib/db";
import type { Pet, ServiceRow } from "@/types/database.types";
import { AgendaForm } from "./AgendaForm";

export default async function AgendaPage() {
  const user = await requireUser("/agenda");

  const pets = queryAll<Pet>("select * from pets where owner_id = ? order by name", user.id);
  const services = queryAll<ServiceRow>("select * from services where active = 1 order by name");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-bold text-brand-900">Agenda tu hora</h1>
      <p className="mt-1 text-brand-900/70">
        Elige la mascota, el servicio, el día y la hora que más te acomode.
      </p>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        {pets.length === 0 ? (
          <div className="text-center">
            <p className="text-brand-900/70">Primero necesitas registrar una mascota.</p>
            <Link
              href="/mis-mascotas"
              className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Registrar mascota
            </Link>
          </div>
        ) : services.length === 0 ? (
          <p className="text-brand-900/70">
            Aún no hay servicios configurados. El staff puede agregarlos desde el panel.
          </p>
        ) : (
          <AgendaForm pets={pets} services={services} />
        )}
      </div>
    </div>
  );
}
