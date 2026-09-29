import { queryAll } from "@/lib/db";
import { saveBusinessHours } from "./actions";

type Hour = { weekday: number; opens_at: string | null; closes_at: string | null; is_closed: number };

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const order = [1, 2, 3, 4, 5, 6, 0];
const input = "rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm";

export default async function AdminHorariosPage() {
  const hours = queryAll<Hour>("select * from business_hours");
  const byDay = new Map(hours.map((h) => [h.weekday, h]));

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-2xl font-bold text-brand-900">Horario de atención</h1>
      <p className="mt-1 text-brand-900/70">
        La agenda online ofrece horas solo dentro de estos horarios. Las citas ya tomadas no se modifican.
      </p>

      <form action={saveBusinessHours} className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {order.map((d) => {
            const h = byDay.get(d);
            return (
              <div key={d} className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-3 text-sm">
                <span className="font-medium text-brand-900">{dayNames[d]}</span>
                <input
                  type="time"
                  name={`opens_${d}`}
                  defaultValue={h?.opens_at ?? "09:00"}
                  aria-label={`${dayNames[d]} apertura`}
                  className={input}
                />
                <input
                  type="time"
                  name={`closes_${d}`}
                  defaultValue={h?.closes_at ?? "19:00"}
                  aria-label={`${dayNames[d]} cierre`}
                  className={input}
                />
                <label className="flex items-center gap-2 text-brand-900/70">
                  <input type="checkbox" name={`closed_${d}`} defaultChecked={!!h?.is_closed} /> Cerrado
                </label>
              </div>
            );
          })}
        </div>
        <button className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Guardar horario
        </button>
      </form>
    </div>
  );
}
