import { siteConfig } from "@/lib/config/site";

export function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-brand-50/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-sm text-brand-900/80 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-brand-800">{siteConfig.name}</p>
          <p className="mt-2">{siteConfig.description}</p>
        </div>

        <div>
          <p className="font-semibold text-brand-800">Horarios</p>
          <ul className="mt-2 space-y-1">
            {siteConfig.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-brand-800">Contacto</p>
          <ul className="mt-2 space-y-1">
            <li>{siteConfig.address}</li>
            <li>{siteConfig.phoneDisplay}</li>
            <li>{siteConfig.email}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-100 py-4 text-center text-xs text-brand-900/60">
        © {new Date().getFullYear()} {siteConfig.name}. Sitio desarrollado por Delta Soluciones.
      </div>
    </footer>
  );
}
