"use client";

import { useActionState, useState, useTransition } from "react";
import type { Pet, ServiceRow } from "@/types/database.types";
import type { Slot } from "@/lib/agenda";
import { getAvailableSlots, bookAppointment } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function AgendaForm({ pets, services }: { pets: Pet[]; services: ServiceRow[] }) {
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, actionPending] = useActionState(bookAppointment, {
    error: null,
    success: false,
  });

  function loadSlots(nextDate: string, nextServiceId: string) {
    setSelectedSlot(null);
    startTransition(async () => {
      const result = await getAvailableSlots(nextDate, nextServiceId);
      setSlots(result);
    });
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="text-3xl">✅</p>
        <h2 className="mt-2 text-xl font-semibold text-brand-900">¡Hora agendada!</h2>
        <p className="mt-1 text-brand-900/70">
          Te esperamos en el horario elegido. Puedes ver tu cita en &quot;Mis mascotas&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Mascota</label>
          <select
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm"
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-900">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              loadSlots(date, e.target.value);
            }}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {service.duration_minutes} min
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Día</label>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => {
            setDate(e.target.value);
            loadSlots(e.target.value, serviceId);
          }}
          className="w-full max-w-xs rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          onClick={() => loadSlots(date, serviceId)}
          className="ml-3 text-sm font-medium text-brand-700 underline underline-offset-2"
        >
          Ver horarios disponibles
        </button>
      </div>

      <div>
        {isPending && <p className="text-sm text-brand-900/60">Buscando horarios...</p>}
        {!isPending && slots.length === 0 && (
          <p className="text-sm text-brand-900/60">
            Elige un día y presiona &quot;Ver horarios disponibles&quot;.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.startISO}
              type="button"
              onClick={() => setSelectedSlot(slot.startISO)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selectedSlot === slot.startISO
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      <form action={formAction}>
        <input type="hidden" name="pet_id" value={petId} />
        <input type="hidden" name="service_id" value={serviceId} />
        <input type="hidden" name="start_iso" value={selectedSlot ?? ""} />

        {state.error && (
          <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={!selectedSlot || actionPending}
          className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionPending ? "Agendando..." : "Confirmar hora"}
        </button>
      </form>
    </div>
  );
}
