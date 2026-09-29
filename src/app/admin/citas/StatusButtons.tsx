"use client";

import { useTransition } from "react";
import type { AppointmentStatus } from "@/types/database.types";
import { updateAppointmentStatus } from "./actions";

const options: { value: AppointmentStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmar" },
  { value: "done", label: "Marcar atendida" },
  { value: "cancelled", label: "Cancelar" },
];

export function StatusButtons({ appointmentId, current }: { appointmentId: string; current: AppointmentStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {options
        .filter((o) => o.value !== current)
        .map((o) => (
          <button
            key={o.value}
            disabled={isPending}
            onClick={() => startTransition(() => updateAppointmentStatus(appointmentId, o.value))}
            className="rounded-full border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
          >
            {o.label}
          </button>
        ))}
    </div>
  );
}
