"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/auth/actions";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  hiddenFields,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  hiddenFields?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-brand-900">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type ?? "text"}
            required={field.required ?? true}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm text-brand-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
        </div>
      ))}

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Enviando..." : submitLabel}
      </button>
    </form>
  );
}
