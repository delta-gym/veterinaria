import Link from "next/link";
import { siteConfig } from "@/lib/config/site";
import { getCurrentUser, isStaff } from "@/lib/auth/session";
import { signOut } from "@/app/auth/actions";

const links = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/agenda", label: "Agendar hora" },
  { href: "/mis-mascotas", label: "Mis mascotas" },
];

export async function Header() {
  const user = await getCurrentUser();
  const userEmail = user?.email ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-brand-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
            🐾
          </span>
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-800/80 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-brand-600">
              {link.label}
            </Link>
          ))}
          {user && isStaff(user) && (
            <Link href="/admin" className="font-semibold text-brand-700 transition-colors hover:text-brand-600">
              Panel clínica
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm font-medium text-brand-800/70 transition-colors hover:text-brand-700"
              >
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link href="/login" className="hidden text-sm font-medium text-brand-800/70 hover:text-brand-700 sm:block">
              Ingresar
            </Link>
          )}

          <Link
            href="/agenda"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Agendar hora
          </Link>
        </div>
      </div>
    </header>
  );
}
