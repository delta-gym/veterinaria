"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { queryOne, run } from "@/lib/db";
import { createSession, destroySession, hashPassword, newId, verifyPassword } from "@/lib/auth/session";

export type FormState = { error: string | null };

// Solo rutas internas: evita que `next` redirija a un sitio externo (open redirect).
function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mis-mascotas";
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const user = queryOne<{ id: string; password_hash: string }>(
    "select id, password_hash from users where email = ?",
    email
  );

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Ingresa un correo electrónico válido." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (queryOne("select 1 from users where email = ?", email)) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const id = newId();
  run(
    "insert into users (id, email, password_hash, full_name, phone) values (?, ?, ?, ?, ?)",
    id,
    email,
    hashPassword(password),
    fullName,
    phone
  );

  await createSession(id);
  revalidatePath("/", "layout");
  redirect("/mis-mascotas");
}

export async function signOut() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
