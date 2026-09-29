"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/citas", label: "Citas" },
  { href: "/admin/pacientes", label: "Pacientes" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/horarios", label: "Horarios" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-5 py-2 text-sm font-medium">
      <span className="mr-3 shrink-0 text-xs font-semibold uppercase tracking-wide text-brand-900/50">
        Panel clínica
      </span>
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-full px-3.5 py-1.5 transition-colors ${
              active ? "bg-brand-600 text-white" : "text-brand-800 hover:bg-brand-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
