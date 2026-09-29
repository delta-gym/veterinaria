import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { signIn } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="text-2xl font-bold text-brand-900">Ingresa a tu cuenta</h1>
      <p className="mt-1 text-sm text-brand-900/60">
        Para ver tus mascotas y tus citas agendadas.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <AuthForm
          action={signIn}
          submitLabel="Ingresar"
          hiddenFields={next ? { next } : undefined}
          fields={[
            { name: "email", label: "Correo electrónico", type: "email" },
            { name: "password", label: "Contraseña", type: "password" },
          ]}
        />
      </div>

      <p className="mt-4 text-center text-sm text-brand-900/70">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-brand-700 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
