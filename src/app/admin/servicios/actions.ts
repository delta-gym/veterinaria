"use server";

import { revalidatePath } from "next/cache";
import { getStaffUser, newId } from "@/lib/auth/session";
import { queryOne, run } from "@/lib/db";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const duration = Number(formData.get("duration_minutes"));
  const priceRaw = String(formData.get("price_clp") ?? "").trim();
  const price = priceRaw === "" ? null : Number(priceRaw);

  const valid =
    name && Number.isInteger(duration) && duration > 0 && (price === null || (Number.isInteger(price) && price >= 0));
  return valid ? { name, description, duration, price } : null;
}

function revalidateServices() {
  revalidatePath("/admin/servicios");
  revalidatePath("/agenda");
  revalidatePath("/");
}

export async function updateService(formData: FormData) {
  if (!(await getStaffUser())) return;
  const id = String(formData.get("id") ?? "");
  const f = parseFields(formData);
  if (!f || !queryOne("select 1 from services where id = ?", id)) return;

  run(
    "update services set name = ?, description = ?, duration_minutes = ?, price_clp = ?, active = ? where id = ?",
    f.name,
    f.description,
    f.duration,
    f.price,
    formData.get("active") ? 1 : 0,
    id
  );
  revalidateServices();
}

export async function createService(formData: FormData) {
  if (!(await getStaffUser())) return;
  const f = parseFields(formData);
  if (!f) return;

  let slug = slugify(f.name) || "servicio";
  for (let i = 2; queryOne("select 1 from services where slug = ?", slug); i++) {
    slug = `${slugify(f.name) || "servicio"}-${i}`;
  }

  run(
    "insert into services (id, slug, name, description, duration_minutes, price_clp, active) values (?, ?, ?, ?, ?, ?, 1)",
    newId(),
    slug,
    f.name,
    f.description,
    f.duration,
    f.price
  );
  revalidateServices();
}
