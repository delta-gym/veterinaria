import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { siteConfig, seedServices, type Service } from "@/lib/config/site";
import { queryAll } from "@/lib/db";
import type { ServiceRow } from "@/types/database.types";

function getServices(): Service[] {
  try {
    const rows = queryAll<ServiceRow>("select * from services where active = 1 order by name");
    if (rows.length === 0) return seedServices;

    return rows.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description ?? "",
      durationMinutes: s.duration_minutes,
      priceCLP: s.price_clp,
    }));
  } catch {
    return seedServices;
  }
}

function formatPrice(priceCLP: number | null) {
  if (priceCLP === null) return "Precio a consultar";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(priceCLP);
}

export default async function HomePage() {
  const services = getServices();

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              Atención en La Araucanía
            </p>
            <h1 className="text-4xl font-bold leading-tight text-brand-900 md:text-5xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-4 max-w-md text-brand-900/70">{siteConfig.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/agenda"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-transform hover:scale-105 hover:bg-brand-700"
              >
                Agendar hora online
              </Link>
              <a
                href={siteConfig.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                Ver ubicación
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-brand-200 via-brand-100 to-accent-100 shadow-xl">
              <div className="flex h-full items-center justify-center text-8xl">🐶🐱</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ SERVICIOS */}
      <section id="servicios" className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Nuestros servicios</h2>
          <p className="mt-2 max-w-2xl text-brand-900/70">
            Todo lo que tu mascota necesita, en un solo lugar — reserva el que quieras desde la agenda online.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="font-semibold text-brand-800">{service.name}</h3>
                <p className="mt-2 text-sm text-brand-900/70">{service.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-brand-900/60">{service.durationMinutes} min</span>
                  <span className="font-semibold text-brand-700">{formatPrice(service.priceCLP)}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ FICHA MASCOTAS */}
      <section className="bg-accent-50/60 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-accent-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold text-accent-600">Ficha digital</p>
              <p className="mt-2 text-lg font-semibold text-brand-900">Firulais · Golden Retriever</p>
              <ul className="mt-4 space-y-2 text-sm text-brand-900/70">
                <li>✓ Última consulta: control general</li>
                <li>✓ Vacuna antirrábica al día</li>
                <li>✓ Peso registrado: 28.4 kg</li>
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">
              La ficha completa de tu mascota, siempre a mano
            </h2>
            <p className="mt-3 text-brand-900/70">
              Historial de atenciones, vacunas, exámenes y peso disponible al instante cuando tu mascota llega a
              consulta — sin cartolas de papel que se pierden.
            </p>
            <Link
              href="/mis-mascotas"
              className="mt-5 inline-block rounded-full border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-white"
            >
              Ver mis mascotas
            </Link>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------- UBICACIÓN */}
      <section id="ubicacion" className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-brand-900 md:text-3xl">Dónde encontrarnos</h2>
          <p className="mt-2 text-brand-900/70">{siteConfig.address}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 overflow-hidden rounded-2xl border border-brand-100 shadow-sm">
          <iframe
            src={siteConfig.googleMapsEmbedUrl}
            width="100%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ubicación de ${siteConfig.name}`}
          />
        </Reveal>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="bg-brand-700 py-14 text-center text-white">
        <Reveal>
          <h2 className="text-2xl font-bold md:text-3xl">¿Listo para agendar la próxima hora?</h2>
          <p className="mt-2 text-brand-100">Elige el servicio, el día y la hora que más te acomode.</p>
          <Link
            href="/agenda"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-transform hover:scale-105"
          >
            Agendar hora online
          </Link>
        </Reveal>
      </section>
    </>
  );
}
