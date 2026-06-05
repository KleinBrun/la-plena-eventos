import { NextResponse } from 'next/server';
import { db, ensureDBReady } from '@/lib/db';
import {
  getCurrentRaffleId,
  getTotalBoletas,
} from '@/lib/raffle';

const TOTAL_BOLETAS = getTotalBoletas();
const CURRENT_RAFFLE_ID = getCurrentRaffleId();
const MAX_INTENTOS_RESERVA = 5;

type ReservaBody = {
  cantidad: number;
  nombre: string;
  telefono: string;
  correo: string;
  referencia: string;
};

export async function POST(req: Request) {
  try {
    await ensureDBReady();

    const {
      cantidad,
      nombre,
      telefono,
      correo,
      referencia,
    } = (await req.json()) as ReservaBody;

    if (!cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: 'Cantidad inválida' },
        { status: 400 }
      );
    }


    const hace30Minutos = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();

    await db.execute({
      sql: `
    DELETE FROM boletas
    WHERE estado = 'RESERVADO'
    AND fecha < ?
    AND raffle_id = ?
  `,
      args: [hace30Minutos, CURRENT_RAFFLE_ID],
    });

    for (
      let intento = 1;
      intento <= MAX_INTENTOS_RESERVA;
      intento++
    ) {
      const ocupados = await db.execute({
        sql: `
          SELECT numero
          FROM boletas
          WHERE estado IN ('RESERVADO', 'PAGADO')
          AND raffle_id = ?
        `,
        args: [CURRENT_RAFFLE_ID],
      });

      const usados = new Set(
        ocupados.rows.map((n) =>
          Number(
            (n as { numero: string | number })
              .numero
          )
        )
      );

      const disponibles: number[] = [];

      for (let i = 1; i <= TOTAL_BOLETAS; i++) {
        if (!usados.has(i)) {
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

      const seleccionados: number[] = [];

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

      try {
        for (const numero of seleccionados) {
          await db.execute({
            sql: `
              INSERT INTO boletas (
                numero,
                nombre,
                telefono,
                correo,
                referencia,
                estado,
                raffle_id
              )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              String(numero),
              nombre,
              telefono,
              correo,
              referencia,
              'RESERVADO',
              CURRENT_RAFFLE_ID,
            ],
          });
        }

        return NextResponse.json({
          numeros: seleccionados,
        });
      } catch (insertError) {
        await db.execute({
          sql: `
            DELETE FROM boletas
            WHERE referencia = ?
            AND estado = 'RESERVADO'
            AND raffle_id = ?
          `,
          args: [referencia, CURRENT_RAFFLE_ID],
        });

        const message =
          insertError instanceof Error
            ? insertError.message
            : String(insertError);

        const esConflictoUnico =
          message.includes('UNIQUE') ||
          message.includes('constraint');

        if (!esConflictoUnico) {
          throw insertError;
        }
      }
    }

    return NextResponse.json({
      error:
        'No se pudo reservar en este momento, intenta de nuevo',
    }, { status: 409 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado';

    console.error('ERROR RESERVAR:', error);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}