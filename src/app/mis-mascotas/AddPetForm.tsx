"use client";

import { useActionState, useRef, useEffect } from "react";
import { addPet } from "./actions";

export function AddPetForm() {
  const [state, formAction, pending] = useActionState(addPet, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input
        name="name"
        placeholder="Nombre de la mascota"
        required
        className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm"
      />
      <select name="species" className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm">
        <option value="perro">Perro</option>
        <option value="gato">Gato</option>
        <option value="otro">Otro</option>
      </select>
      <input
        name="breed"
        placeholder="Raza (opcional)"
        className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm"
      />
      <input
        name="birth_date"
        type="date"
        max={new Date().toISOString().slice(0, 10)}
        aria-label="Fecha de nacimiento"
        placeholder="Fecha de nacimiento"
        className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm"
      />
      <input
        name="weight_kg"
        type="number"
        step="0.1"
        placeholder="Peso (kg, opcional)"
        className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm"
      />

      <div className="sm:col-span-2">
        {state.error && <p className="mb-2 text-sm text-red-700">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Agregar mascota"}
        </button>
      </div>
    </form>
  );
}
