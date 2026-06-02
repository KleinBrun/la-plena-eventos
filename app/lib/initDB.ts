import { openDB } from './db';

export async function initDB() {
    const db = await openDB();

    await db.exec(`
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

    return db;
}