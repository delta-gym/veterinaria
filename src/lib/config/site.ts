// -----------------------------------------------------------------------------
// CONFIGURACIÓN DEL NEGOCIO
// Edita este archivo con los datos reales del cliente antes de lanzar el sitio.
// Todo el contenido de la landing (Paso 4 del README) lee desde aquí.
// -----------------------------------------------------------------------------

export const siteConfig = {
  name: "Veterinaria Huellas del Sur",
  tagline: "Cuidado cercano para tu mascota, en el corazón de La Araucanía",
  description:
    "Consultas, peluquería, ecografías y control de vacunas para perros y gatos. Agenda tu hora online, a cualquier hora.",

  // Contacto — REEMPLAZA por los datos reales
  phoneDisplay: "+56 9 1234 5678",
  whatsappNumber: "56912345678", // solo dígitos, con código de país, sin '+' ni espacios
  email: "contacto@veterinariahuellasdelsur.cl",
  address: "Av. Alemania 1234, Temuco, Región de La Araucanía",

  // Mapa: reemplaza por el "Compartir > Insertar un mapa" de Google Maps de la ubicación real
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3245.318!2d-72.5904!3d-38.7359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDQ0JzA5LjIiUyA3MsKwMzUnMjUuNCJX!5e0!3m2!1ses!2scl!4v1700000000000",
  googleMapsLink: "https://maps.google.com/?q=Temuco,La+Araucanía",

  hours: [
    { day: "Lunes a Viernes", time: "9:00 – 19:00" },
    { day: "Sábado", time: "9:30 – 14:00" },
    { day: "Domingo", time: "Cerrado" },
  ],

  socials: {
    instagram: "https://instagram.com/veterinariahuellasdelsur",
  },
} as const;

export type Service = {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCLP: number | null; // null = "Precio a consultar"
};

// Listado de respaldo — la fuente de verdad es la tabla `services` en SQLite
// (semilla en src/lib/db/schema.ts).
export const seedServices: Service[] = [
  {
    slug: "consulta-general",
    name: "Consulta general",
    description: "Chequeo completo, diagnóstico y orientación de tratamiento.",
    durationMinutes: 30,
    priceCLP: 18000,
  },
  {
    slug: "vacunacion",
    name: "Vacunación",
    description: "Plan de vacunas según edad y especie, con carné actualizado.",
    durationMinutes: 20,
    priceCLP: 15000,
  },
  {
    slug: "peluqueria",
    name: "Peluquería y baño",
    description: "Baño, corte y desenredado, adaptado al tipo de pelaje.",
    durationMinutes: 60,
    priceCLP: 20000,
  },
  {
    slug: "ecografia",
    name: "Ecografía",
    description: "Estudio de imagen para diagnóstico interno detallado.",
    durationMinutes: 45,
    priceCLP: 35000,
  },
  {
    slug: "cirugia-menor",
    name: "Cirugía menor",
    description: "Esterilización y procedimientos ambulatorios menores.",
    durationMinutes: 90,
    priceCLP: null,
  },
];
