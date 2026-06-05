import { db, ensureDBReady } from '@/lib/db';
import { transporter } from '@/lib/mail';
import {
  renderPaidTicketsEmail,
  renderSoldOutEmail,
} from '@/lib/email-templates';
import { normalizeTicketNumber } from '@/lib/ticket-numbers';
import {
  getCurrentRaffleId,
  getTotalBoletas,
} from '@/lib/raffle';

const TOTAL_BOLETAS = getTotalBoletas();
const CURRENT_RAFFLE_ID = getCurrentRaffleId();

type BoletaEstadoRow = {
  numero: string | number;
  nombre: string;
  correo: string;
  estado: string;
};

type ConfirmResult = {
  ok: boolean;
  notFound?: boolean;
  alreadyProcessed?: boolean;
  comprador?: {
    nombre: string;
    correo: string;
  };
  numeros?: number[];
};

export async function confirmPaidTickets(
  referencia: string
): Promise<ConfirmResult> {
  await ensureDBReady();

  const paidBeforeResult = await db.execute({
    sql: `
      SELECT COUNT(*) AS total
      FROM boletas
      WHERE estado = 'PAGADO'
      AND raffle_id = ?
    `,
    args: [CURRENT_RAFFLE_ID],
  });

  const paidBefore = Number(
    (paidBeforeResult.rows[0] as unknown as {
      total: string | number;
    })?.total ?? 0
  );

  const result = await db.execute({
    sql: `
      SELECT numero, nombre, correo, estado
      FROM boletas
      WHERE referencia = ?
      AND raffle_id = ?
    `,
    args: [referencia, CURRENT_RAFFLE_ID],
  });

  const rows = result.rows as unknown as BoletaEstadoRow[];

  if (rows.length === 0) {
    return { ok: false, notFound: true };
  }

  const reservadas = rows.filter(
    (row) => row.estado === 'RESERVADO'
  );

  if (reservadas.length === 0) {
    const pagadas = rows.filter(
      (row) => row.estado === 'PAGADO'
    );

    return {
      ok: true,
      alreadyProcessed: pagadas.length > 0,
      comprador: pagadas[0]
        ? {
            nombre: pagadas[0].nombre,
            correo: pagadas[0].correo,
          }
        : undefined,
      numeros: pagadas
        .map((row) =>
          normalizeTicketNumber(row.numero)
        )
        .filter((numero) => numero > 0)
        .sort((left, right) => left - right),
    };
  }

  const comprador = reservadas[0];
  const numeros = reservadas
    .map((row) =>
      normalizeTicketNumber(row.numero)
    )
    .filter((numero) => numero > 0)
    .sort((left, right) => left - right);

  await db.execute({
    sql: `
      UPDATE boletas
      SET estado = 'PAGADO'
      WHERE referencia = ?
      AND estado = 'RESERVADO'
      AND raffle_id = ?
    `,
    args: [referencia, CURRENT_RAFFLE_ID],
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: comprador.correo,
    subject: 'Tus boletas de La Plena',
    html: renderPaidTicketsEmail({
      nombre: comprador.nombre,
      numeros,
    }),
  });

  const paidAfterResult = await db.execute({
    sql: `
      SELECT COUNT(*) AS total
      FROM boletas
      WHERE estado = 'PAGADO'
      AND raffle_id = ?
    `,
    args: [CURRENT_RAFFLE_ID],
  });

  const paidAfter = Number(
    (paidAfterResult.rows[0] as unknown as {
      total: string | number;
    })?.total ?? 0
  );

  if (
    paidBefore < TOTAL_BOLETAS &&
    paidAfter >= TOTAL_BOLETAS &&
    process.env.EMAIL_USER
  ) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Rifa ${CURRENT_RAFFLE_ID} vendida al 100%`,
      html: renderSoldOutEmail({
        totalBoletas: TOTAL_BOLETAS,
      }),
    });
  }

  return {
    ok: true,
    comprador: {
      nombre: comprador.nombre,
      correo: comprador.correo,
    },
    numeros,
  };
}