// Uso: npm run make-staff -- correo@ejemplo.cl [staff|admin]
// Da rol de equipo a un usuario ya registrado (habilita /admin/citas).
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const [email, role = "staff"] = process.argv.slice(2);

if (!email || !["staff", "admin"].includes(role)) {
  console.error("Uso: npm run make-staff -- correo@ejemplo.cl [staff|admin]");
  process.exit(1);
}

const db = new DatabaseSync(resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/veterinaria.db"));
const result = db.prepare("update users set role = ? where email = ?").run(role, email.trim().toLowerCase());

if (result.changes === 0) {
  console.error(`No existe un usuario con el correo ${email}. Regístrate primero en /registro.`);
  process.exit(1);
}

console.log(`${email} ahora tiene rol "${role}".`);
