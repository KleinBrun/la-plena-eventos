import { NextResponse } from 'next/server';
import { openDB } from '../../lib/db';
import { transporter } from '../../lib/lib/mail';

export async function POST(req: Request) {
  const {
    cantidad,
    nombre,
    telefono,
    correo,
    referencia,
  } = await req.json();

  const db = await openDB();

  const hace30Minutos = new Date(
    Date.now() - 30 * 60 * 1000
  ).toISOString();

  await db.run(`
  DELETE FROM boletas
  WHERE estado = 'RESERVADO'
  AND fecha < ?
`, hace30Minutos);

  const ocupados = await db.all(`
    SELECT numero
    FROM boletas
    WHERE estado IN ('RESERVADO','PAGADO')
  `);

  const usados = ocupados.map(
    (n: any) => Number(n.numero)
  );

  const disponibles = [];

  for (let i = 1; i <= 700; i++) {
    if (!usados.includes(i)) {
      disponibles.push(i);
    }
  }

  if (disponibles.length < cantidad) {
    return NextResponse.json(
      {
        error:
          'No hay suficientes boletas disponibles',
      },
      { status: 400 }
    );
  }

  const seleccionados = [];

  while (
    seleccionados.length < cantidad
  ) {
    const indice = Math.floor(
      Math.random() *
      disponibles.length
    );

    seleccionados.push(
      disponibles.splice(indice, 1)[0]
    );
  }

  for (const numero of seleccionados) {
    await db.run(
      `
      INSERT INTO boletas (
        numero,
        nombre,
        telefono,
        correo,
        referencia,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      numero,
      nombre,
      telefono,
      correo,
      referencia,
      'RESERVADO'
    );
  }

  return NextResponse.json({
    numeros: seleccionados,
  });
}