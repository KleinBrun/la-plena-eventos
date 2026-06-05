import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

let dbReadyPromise: Promise<void> | null = null;

async function createBoletasTable(tableName: string) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raffle_id INTEGER NOT NULL DEFAULT 1,
      numero TEXT NOT NULL,
      nombre TEXT,
      telefono TEXT,
      correo TEXT,
      referencia TEXT,
      estado TEXT DEFAULT 'RESERVADO',
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(raffle_id, numero)
    )
  `);
}

async function ensureBoletasSchema() {
  await createBoletasTable('boletas');

  const tableInfo = await db.execute(
    'PRAGMA table_info(boletas)'
  );

  const hasRaffleId = tableInfo.rows.some(
    (row) =>
      (row as { name?: string }).name ===
      'raffle_id'
  );

  if (!hasRaffleId) {
    await createBoletasTable('boletas_new');

    await db.execute(`
      INSERT INTO boletas_new (
        numero,
        nombre,
        telefono,
        correo,
        referencia,
        estado,
        fecha,
        raffle_id
      )
      SELECT
        numero,
        nombre,
        telefono,
        correo,
        referencia,
        estado,
        fecha,
        1
      FROM boletas
    `);

    await db.execute('DROP TABLE boletas');
    await db.execute(
      'ALTER TABLE boletas_new RENAME TO boletas'
    );
  }

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_boletas_raffle_estado
    ON boletas (raffle_id, estado)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_boletas_raffle_ref
    ON boletas (raffle_id, referencia)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_boletas_raffle_correo
    ON boletas (raffle_id, correo)
  `);
}

export async function initDB() {
  await ensureBoletasSchema();
}

export async function ensureDBReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = initDB();
  }

  await dbReadyPromise;
}
