import { db } from '../../lib/db';
import { NextResponse } from 'next/server';
import { transporter } from '../../lib/lib/mail';

export async function POST(req: Request) {
  const body = await req.json();

  if (body.event === 'transaction.updated') {
    const transaccion = body.data.transaction;

    console.log(
      'REFERENCIA WOMPI:',
      transaccion.reference
    );

    if (transaccion.status === 'APPROVED') {

      const resultado = await db.execute({
        sql: `
          SELECT *
          FROM boletas
          WHERE referencia = ?
          AND estado = 'RESERVADO'
        `,
        args: [transaccion.reference],
      });

      const boletas = resultado.rows;

      if (boletas.length === 0) {
        return NextResponse.json({
          ok: true,
        });
      }

      const numeros = boletas.map(
        (b: any) => b.numero
      );

      const comprador: any = boletas[0];

      await db.execute({
        sql: `
          UPDATE boletas
          SET estado = 'PAGADO'
          WHERE referencia = ?
        `,
        args: [transaccion.reference],
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: comprador.correo,
        subject: 'Tus boletas de La Plena',
        html: `
          <h2>¡Pago recibido!</h2>
          <p>Hola ${comprador.nombre}</p>
          <p>Estos son tus números:</p>
          <h1>${numeros.join(' - ')}</h1>
          <p>Mucha suerte 🍀</p>
        `,
      });
    }
  }

  return NextResponse.json({
    ok: true,
  });
}