import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDB() {
  const db = await open({
    filename: './rifa.db',
    driver: sqlite3.Database,
  });

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