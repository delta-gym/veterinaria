import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";

export default function RegistroPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="text-2xl font-bold text-brand-900">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-brand-900/60">
        Para agendar horas y ver la ficha de tus mascotas online.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <AuthForm
          action={signUp}
          submitLabel="Crear cuenta"
          fields={[
            { name: "full_name", label: "Nombre completo" },
            { name: "phone", label: "Teléfono / WhatsApp", type: "tel", required: false },
            { name: "email", label: "Correo electrónico", type: "email" },
            { name: "password", label: "Contraseña (mín. 6 caracteres)", type: "password" },
          ]}
        />
      </div>

      <p className="mt-4 text-center text-sm text-brand-900/70">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Ingresa
        </Link>
      </p>
    </div>
  );
}
