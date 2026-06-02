import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS boletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE,
      nombre TEXT,
      telefono TEXT,
      correo TEXT,
      referencia TEXT,
      estado TEXT DEFAULT 'RESERVADO',
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}