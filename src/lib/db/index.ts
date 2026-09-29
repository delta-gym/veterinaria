import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { schemaSql, seedSql } from "./schema";

// Archivo local de la base de datos. Cambia la ruta con DATABASE_PATH en .env.local.
const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/veterinaria.db");

const globalForDb = globalThis as unknown as { __vetDb?: DatabaseSync };

function open() {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("pragma journal_mode = wal");
  db.exec("pragma foreign_keys = on");
  db.exec("pragma busy_timeout = 5000");
  db.exec(schemaSql);
  db.exec(seedSql);
  return db;
}

// Una sola conexión por proceso (también sobrevive al hot reload de `next dev`).
export function getDb() {
  globalForDb.__vetDb ??= open();
  return globalForDb.__vetDb;
}

// Las filas de node:sqlite tienen prototipo nulo; se copian a objetos planos
// para poder pasarlas de Server Components a Client Components.
export function queryAll<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return getDb()
    .prepare(sql)
    .all(...params)
    .map((row) => ({ ...row })) as T[];
}

export function queryOne<T>(sql: string, ...params: SQLInputValue[]): T | null {
  const row = getDb().prepare(sql).get(...params);
  return row ? ({ ...row } as T) : null;
}

export function run(sql: string, ...params: SQLInputValue[]) {
  return getDb().prepare(sql).run(...params);
}

// Ejecuta `fn` dentro de una transacción con lock de escritura (BEGIN IMMEDIATE),
// para que dos reservas simultáneas no puedan tomar el mismo horario.
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("begin immediate");
  try {
    const result = fn();
    db.exec("commit");
    return result;
  } catch (error) {
    db.exec("rollback");
    throw error;
  }
}
