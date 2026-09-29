# Veterinaria Huellas del Sur — sitio web + agenda + fichas de mascotas

Proyecto **Next.js 16 + SQLite local**. Incluye:

- Landing con servicios, ubicación (Google Maps) y botón de WhatsApp.
- Registro/login de dueños (cuentas propias en SQLite, contraseñas con scrypt, sesión por cookie).
- Agenda online sin choques de horario (se valida dentro de una transacción de SQLite).
- Ficha de mascota: historial de atenciones, vacunas y peso.
- Panel de staff con todas las citas ordenadas.

Colores/paleta, textos y datos de contacto son de ejemplo — se editan en un solo archivo (Paso 3).

---

## Paso 1 — Instalar y correr en local

Requiere **Node 22.13 o superior** (usa el módulo `node:sqlite` incluido en Node, sin dependencias nativas).

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. La primera vez se crea solo el archivo `data/veterinaria.db` con las tablas,
los servicios de ejemplo y el horario de atención (lunes a viernes 9:00–19:00, sábado 9:30–14:00).
No hay que configurar nada más. Para usar otra ruta, define `DATABASE_PATH` en `.env.local`.

> Node muestra un aviso `ExperimentalWarning: SQLite is an experimental feature`. Es normal e inofensivo.

## Paso 2 — Crear tu cuenta de staff

Regístrate en `/registro` y luego, en la terminal:

```bash
npm run make-staff -- tu@correo.cl        # o: ... tu@correo.cl admin
```

Con eso ves el panel `/admin/citas`. Para respaldar los datos basta con copiar `data/veterinaria.db`
(con el servidor detenido, o junto a sus archivos `-wal` y `-shm`).

## Paso 3 — Personalizar marca y contenido

Todo el contenido editable de la landing (nombre, dirección, teléfono/WhatsApp, mapa, horarios, servicios
de ejemplo) está en **un solo archivo**:

```
src/lib/config/site.ts
```

Colores de marca (verde/azul "calma y confianza") en `src/app/globals.css`, sección `:root`.

## Paso 4 — Subir a GitHub

```bash
git add .
git commit -m "Setup inicial: Next.js + Supabase"
```

Crea un repo privado en [github.com/new](https://github.com/new) y:

```bash
git remote add origin https://github.com/<tu-usuario>/veterinaria-web.git
git branch -M main
git push -u origin main
```

`.env.local` nunca se sube (está en `.gitignore`) — ahí están tus keys.

## Paso 5 — Desplegar

SQLite guarda todo en un archivo local, así que el hosting debe tener **disco persistente** (un VPS, Railway
o Fly con volumen, etc.). Plataformas serverless como Vercel **no sirven** con este esquema: su disco se
borra en cada deploy. Al desplegar define `TZ=America/Santiago` (los horarios de la agenda usan la zona
horaria del servidor) y monta `data/` en el volumen persistente.

---

## Estructura del proyecto

```
src/
├─ app/
│  ├─ page.tsx                landing
│  ├─ login/, registro/       auth
│  ├─ agenda/                 agenda online (protegida)
│  ├─ mis-mascotas/           ficha de mascotas del dueño (protegida)
│  └─ admin/citas/            panel staff (protegida, solo role staff/admin)
├─ components/                Header, Footer, WhatsAppButton, Reveal (animaciones), AuthForm
├─ lib/
│  ├─ db/                      conexión SQLite (index.ts) y schema + datos semilla (schema.ts)
│  ├─ auth/                    sesiones, hash de contraseñas, requireUser()
│  ├─ agenda.ts                cálculo de horarios libres
│  └─ config/site.ts           ← EDITA AQUÍ el contenido de marca
├─ types/database.types.ts     tipos que reflejan el schema SQL
└─ proxy.ts                    redirige a /login si falta la cookie de sesión

scripts/make-staff.mjs         da rol staff/admin a un usuario
data/                          base SQLite local (ignorada por git)
```

## Notas de seguridad

- No hay RLS: la autorización se hace en el código. Cada página privada llama a `requireUser()` y cada
  server action comprueba el usuario (una mascota solo se puede agendar por su dueño; cambiar el estado de
  una cita exige rol staff/admin).
- La agenda revisa disponibilidad dentro de una transacción `BEGIN IMMEDIATE`: dos personas no pueden
  reservar el mismo horario ni horarios traslapados.
- Las contraseñas se guardan con scrypt + sal; la cookie de sesión es `httpOnly` y en la base solo se
  guarda su hash SHA-256.
- Aún no hay recuperación de contraseña ni límite de intentos de login.
- La carpeta `supabase/` quedó solo como referencia del esquema anterior (Postgres); ya no se usa.
