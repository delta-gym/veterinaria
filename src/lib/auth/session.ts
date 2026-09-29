import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { queryOne, run } from "@/lib/db";
import type { ProfileRole } from "@/types/database.types";
import { SESSION_COOKIE } from "./constants";

const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: ProfileRole;
};

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  run(
    "insert into sessions (token_hash, user_id, expires_at) values (?, ?, ?)",
    hashToken(token),
    userId,
    expires.toISOString()
  );

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) run("delete from sessions where token_hash = ?", hashToken(token));
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  return queryOne<CurrentUser>(
    `select u.id, u.email, u.full_name, u.phone, u.role
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = ? and s.expires_at > ?`,
    hashToken(token),
    new Date().toISOString()
  );
}

// Para páginas privadas: el proxy solo mira que exista la cookie; acá se valida de verdad.
export async function requireUser(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export const isStaff = (user: CurrentUser) => user.role === "staff" || user.role === "admin";

// Para server actions del panel: devuelve el usuario solo si es staff/admin.
export async function getStaffUser() {
  const user = await getCurrentUser();
  return user && isStaff(user) ? user : null;
}

export const newId = () => randomUUID();
