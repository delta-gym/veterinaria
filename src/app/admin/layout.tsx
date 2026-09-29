import { isStaff, requireUser } from "@/lib/auth/session";
import { AdminTabs } from "./AdminTabs";

// Todo lo que cuelga de /admin es solo para el equipo de la clínica.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/admin");

  if (!isStaff(user)) {
    return (
      <div className="mx-auto max-w-lg px-5 py-24 text-center">
        <h1 className="text-xl font-semibold text-brand-900">Acceso solo para el equipo</h1>
        <p className="mt-2 text-brand-900/70">
          Esta sección es exclusiva del staff de la clínica. Para darte acceso, ejecuta{" "}
          <code>npm run make-staff -- tu@correo.cl</code> en el servidor.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-brand-100 bg-brand-50/60">
        <AdminTabs />
      </div>
      {children}
    </>
  );
}
