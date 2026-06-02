import { openDB } from '../../lib/db';
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

      const db = await openDB();

      const boletas = await db.all(
        `
        SELECT *
        FROM boletas
        WHERE referencia = ?
        AND estado = 'RESERVADO'
        `,
        transaccion.reference
      );

      if (boletas.length === 0) {
        return NextResponse.json({ ok: true });
      }
      
      if (boletas.length > 0) {

        const numeros = boletas.map(
          (b: any) => b.numero
        );

        const comprador = boletas[0];

        await db.run(
          `
          UPDATE boletas
          SET estado = 'PAGADO'
          WHERE referencia = ?
          `,
          transaccion.reference
        );

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: comprador.correo,
          subject: 'Tus boletas de La Plena',
          html: `
    <h2>¡Pago recibido!</h2>
    <p>Hola ${comprador.nombre}</p>
    <p>Estos son tus números:</p>
    <h1>${numeros.join(' - ')}</h1>
  `,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
  });
}