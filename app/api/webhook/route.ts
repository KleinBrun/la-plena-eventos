import { NextResponse } from 'next/server';
import { confirmPaidTickets } from '@/lib/confirm-paid-tickets';
import { createHash, timingSafeEqual } from 'node:crypto';

type WebhookBody = {
  event?: string;
  timestamp?: number | string;
  signature?: {
    checksum?: string;
    properties?: string[];
  };
  data?: {
    transaction?: {
      reference?: string;
      status?: string;
    };
  };
  [key: string]: unknown;
};

function getNestedValue(
  source: unknown,
  path: string
): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, key) => {
      if (
        acc &&
        typeof acc === 'object' &&
        key in (acc as Record<string, unknown>)
      ) {
        return (acc as Record<string, unknown>)[key];
      }

      return undefined;
    }, source);
}

function resolvePropertyValue(
  body: WebhookBody,
  property: string
): string {
  const directFromBody = getNestedValue(
    body,
    property
  );

  const fromData = getNestedValue(
    body.data,
    property
  );

  const fromDataPrefixed = property.startsWith('data.')
    ? getNestedValue(body, property)
    : getNestedValue(body, `data.${property}`);

  const value =
    directFromBody ??
    fromData ??
    fromDataPrefixed;

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}

function isWompiSignatureValid(
  body: WebhookBody
): boolean {
  const secret =
    process.env.WOMPI_EVENTS_SECRET ??
    process.env.WOMPI_WEBHOOK_SECRET ??
    process.env.WOMPI_INTEGRITY_SECRET ??
    process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_SECRET;

  if (!secret) {
    console.error(
      'Falta WOMPI_EVENTS_SECRET o WOMPI_WEBHOOK_SECRET'
    );
    return false;
  }

  const checksum =
    body.signature?.checksum;
  const properties =
    body.signature?.properties;
  const timestamp = body.timestamp;

  if (
    !checksum ||
    !timestamp ||
    !Array.isArray(properties) ||
    properties.length === 0
  ) {
    return false;
  }

  const payload =
    properties
      .map((property) =>
        resolvePropertyValue(body, property)
      )
      .join('') +
    String(timestamp) +
    secret;

  const computed = createHash('sha256')
    .update(payload)
    .digest('hex');

  const checksumBuffer = Buffer.from(
    checksum.toLowerCase()
  );
  const computedBuffer = Buffer.from(
    computed.toLowerCase()
  );

  if (
    checksumBuffer.length !==
    computedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    checksumBuffer,
    computedBuffer
  );
}

function parseTimestampMs(
  timestamp: number | string | undefined
): number | null {
  if (timestamp === undefined) {
    return null;
  }

  const parsed = Number(timestamp);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  // Wompi puede enviar epoch en segundos o milisegundos.
  if (parsed < 1_000_000_000_000) {
    return Math.trunc(parsed * 1000);
  }

  return Math.trunc(parsed);
}

function isFreshWebhookTimestamp(
  timestamp: number | string | undefined
): boolean {
  const timestampMs = parseTimestampMs(timestamp);

  if (!timestampMs) {
    return false;
  }

  const maxAgeSeconds = Number(
    process.env.WOMPI_WEBHOOK_MAX_AGE_SECONDS ??
      300
  );

  const safeMaxAgeSeconds =
    Number.isFinite(maxAgeSeconds) &&
    maxAgeSeconds > 0
      ? maxAgeSeconds
      : 300;

  const maxAgeMs = safeMaxAgeSeconds * 1000;
  const drift = Math.abs(Date.now() - timestampMs);

  return drift <= maxAgeMs;
}

export async function POST(req: Request) {
  try {
    const body =
      (await req.json()) as WebhookBody;
    console.log('WEBHOOK BODY:', JSON.stringify(body));

    if (!isWompiSignatureValid(body)) {
      return NextResponse.json(
        {
          error:
            'Firma de webhook invalida',
        },
        { status: 401 }
      );
    }

    if (!isFreshWebhookTimestamp(body.timestamp)) {
      return NextResponse.json(
        {
          error:
            'Webhook fuera de ventana de tiempo',
        },
        { status: 401 }
      );
    }

    if (
      body.event === 'transaction.updated' &&
      body.data?.transaction
    ) {
      const transaccion = body.data.transaction;

      console.log('REFERENCIA WOMPI:', transaccion.reference);
      console.log('ESTADO TRANSACCIÓN:', transaccion.status);

      if (
        transaccion.status === 'APPROVED' &&
        transaccion.reference
      ) {
        const confirmation = await confirmPaidTickets(
          transaccion.reference
        );

        if (confirmation.notFound) {
          console.log('NO SE ENCONTRARON BOLETAS PARA ESTA REFERENCIA');
          return NextResponse.json({ ok: true });
        }

        if (confirmation.alreadyProcessed) {
          console.log('REFERENCIA YA PROCESADA:', transaccion.reference);
          return NextResponse.json({ ok: true });
        }

        console.log('EMAIL ENVIADO A:', confirmation.comprador?.correo);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error inesperado';

    console.error('ERROR WEBHOOK:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}