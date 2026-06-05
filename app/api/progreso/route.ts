import { NextResponse } from 'next/server';
import { db, ensureDBReady } from '@/lib/db';
import {
  getCurrentRaffleId,
  getTotalBoletas,
} from '@/lib/raffle';

const TOTAL_BOLETAS = getTotalBoletas();
const CURRENT_RAFFLE_ID = getCurrentRaffleId();

export async function GET() {
  try {
    await ensureDBReady();

    const result = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM boletas
        WHERE estado = 'PAGADO'
        AND raffle_id = ?
      `,
      args: [CURRENT_RAFFLE_ID],
    });

    const vendidas = Number(
      (result.rows[0] as { total: string | number })
        ?.total ?? 0
    );

    const porcentaje = Math.min(
      100,
      Math.round((vendidas / TOTAL_BOLETAS) * 100)
    );

    return NextResponse.json({
      total: TOTAL_BOLETAS,
      vendidas,
      porcentaje,
      restantes: Math.max(
        TOTAL_BOLETAS - vendidas,
        0
      ),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
