import { queryAll } from "@/lib/db";
import type { ServiceRow } from "@/types/database.types";
import { createService, updateService } from "./actions";

const input = "rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm";
const button = "rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700";

export default async function AdminServiciosPage() {
  const services = queryAll<ServiceRow>("select * from services order by active desc, name");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Servicios</h1>
      <p className="mt-1 text-brand-900/70">
        Lo que se muestra en la web y se puede agendar. Los servicios desactivados dejan de aparecer, pero no se
        pierden sus citas anteriores.
      </p>

      <div className="mt-6 space-y-3">
        {services.map((s) => (
          <form
            key={s.id}
            action={updateService}
            className={`grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm md:grid-cols-[1fr_90px_120px_auto] ${
              s.active ? "" : "opacity-60"
            }`}
          >
            <input type="hidden" name="id" value={s.id} />
            <div className="grid gap-2">
              <input name="name" defaultValue={s.name} required aria-label="Nombre" className={input} />
              <input
                name="description"
                defaultValue={s.description ?? ""}
                placeholder="Descripción"
                aria-label="Descripción"
                className={input}
              />
            </div>
            <label className="text-xs text-brand-900/60">
              Minutos
              <input
                name="duration_minutes"
                type="number"
                min="5"
                step="5"
                defaultValue={s.duration_minutes}
                required
                className={`${input} mt-1 w-full`}
              />
            </label>
            <label className="text-xs text-brand-900/60">
              Precio CLP
              <input
                name="price_clp"
                type="number"
                min="0"
                step="500"
                defaultValue={s.price_clp ?? ""}
                placeholder="A consultar"
                className={`${input} mt-1 w-full`}
              />
            </label>
            <div className="flex items-end justify-between gap-3 md:flex-col md:items-stretch">
              <label className="flex items-center gap-2 text-sm text-brand-900/70">
                <input type="checkbox" name="active" defaultChecked={!!s.active} /> Activo
              </label>
              <button className={button}>Guardar</button>
            </div>
          </form>
        ))}
      </div>

      <form
        action={createService}
        className="mt-8 grid gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-4 md:grid-cols-[1fr_90px_120px_auto]"
      >
        <div className="grid gap-2">
          <input name="name" placeholder="Nuevo servicio (ej. Desparasitación)" required className={input} />
          <input name="description" placeholder="Descripción (opcional)" className={input} />
        </div>
        <input name="duration_minutes" type="number" min="5" step="5" defaultValue={30} required aria-label="Minutos" className={`${input} self-start`} />
        <input name="price_clp" type="number" min="0" step="500" placeholder="Precio CLP" aria-label="Precio" className={`${input} self-start`} />
        <button className={`${button} self-start`}>Agregar</button>
      </form>
    </div>
  );
}
