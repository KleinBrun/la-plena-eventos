import { db } from '../../lib/db';
import { NextResponse } from 'next/server';
import { transporter } from '../../lib/lib/mail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('WEBHOOK BODY:', JSON.stringify(body));

    if (body.event === 'transaction.updated') {
      const transaccion = body.data.transaction;

      console.log('REFERENCIA WOMPI:', transaccion.reference);
      console.log('ESTADO TRANSACCIÓN:', transaccion.status);

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
        console.log('NO SE ENCONTRARON BOLETAS RESERVADAS PARA ESTA REFERENCIA');
        return NextResponse.json({ ok: true });
      }

      console.log('BOLETAS ENCONTRADAS:', boletas.length);

      const numeros = boletas.map((b: any) => b.numero);

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

      console.log('EMAIL ENVIADO A:', comprador.correo);
    }
  }

  return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('ERROR WEBHOOK:', error);
    return NextResponse.json(
      { error: error.message ?? 'Error inesperado' },
      { status: 500 }
    );
  }
}