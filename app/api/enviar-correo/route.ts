import { NextResponse } from 'next/server';
import { transporter } from '../../lib/lib/mail';

export async function POST(req: Request) {
    try {
        const {
            nombre,
            correo,
            numeros,
        } = await req.json();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: correo,
            subject: 'Boletas asignadas - La Plena Eventos',

            html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Hola ${nombre}</h2>

          <p>
            Gracias por participar en nuestra rifa.
          </p>

          <h3>Tus números son:</h3>

          <div style="
            background:#FF3B01;
            color:white;
            padding:15px;
            border-radius:10px;
            font-size:24px;
            font-weight:bold;
          ">
            ${numeros.join(' - ')}
          </div>

          <p style="margin-top:20px">
            Mucha suerte 🍀
          </p>

          <strong>
            LA PLENA EVENTOS
          </strong>
        </div>
      `,
        });

        return NextResponse.json({
            ok: true,
        });
    } catch (error: any) {
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