import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('Entró a reservar');

    const body = await req.json();

    console.log(body);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado';

    console.error(error);

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