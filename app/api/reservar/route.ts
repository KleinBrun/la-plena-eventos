import { NextResponse } from 'next/server';
import { db } from '../../lib/db';

export async function POST(req: Request) {
  try {
    const {
      cantidad,
      nombre,
      telefono,
      correo,
      referencia,
    } = await req.json();


    const hace30Minutos = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();

    await db.execute({
      sql: `
    DELETE FROM boletas
    WHERE estado = 'RESERVADO'
    AND fecha < ?
  `,
      args: [hace30Minutos],
    });

    const ocupados = await db.execute(`
    SELECT numero
    FROM boletas
    WHERE estado IN ('RESERVADO','PAGADO')
  `);

    const usados = ocupados.rows.map(
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
      await db.execute({
        sql: `
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
        args: [
          numero,
          nombre,
          telefono,
          correo,
          referencia,
          'RESERVADO',
        ],
      });
    }

    return NextResponse.json({
      numeros: seleccionados,
    });
  } catch (error: any) {
    console.error('ERROR RESERVAR:', error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}