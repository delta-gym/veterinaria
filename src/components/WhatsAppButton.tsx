import { siteConfig } from "@/lib/config/site";

export function WhatsAppButton() {
  const message = encodeURIComponent(
    `Hola, quiero agendar una hora en ${siteConfig.name}.`
  );
  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-brand-900/20 transition-transform hover:scale-105 hover:bg-brand-700 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.29.639 4.43 1.75 6.257L4 29l7.94-1.71A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.98 16.87c-.29.815-1.44 1.5-2.36 1.695-.64.135-1.47.24-4.27-.92-3.585-1.485-5.89-5.1-6.07-5.34-.175-.24-1.45-1.93-1.45-3.685s.92-2.615 1.245-2.975c.33-.36.71-.45.945-.45.235 0 .47.003.675.014.216.011.507-.082.792.605.29.7.985 2.42 1.07 2.6.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.375.465-.535.625-.18.18-.365.375-.157.735.21.36.93 1.53 1.995 2.475 1.37 1.22 2.52 1.6 2.885 1.78.365.18.575.15.79-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.09.15.09.87-.2 1.71Z" />
      </svg>
      WhatsApp
    </a>
  );
}
