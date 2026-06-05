import { formatTicketNumbers } from '@/lib/ticket-numbers';

type TicketEmailData = {
  nombre: string;
  numeros: Array<string | number>;
};

function renderBaseTemplate({
  title,
  intro,
  nombre,
  numeros,
}: {
  title: string;
  intro: string;
  nombre: string;
  numeros: Array<string | number>;
}) {
  return `
    <div style="background:#fff7ed;padding:32px 16px;font-family:Arial,sans-serif;color:#431407;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #fed7aa;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(194,65,12,0.12);">
        <div style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 24px;color:#fff7ed;">
          <div style="font-size:12px;letter-spacing:0.14em;font-weight:700;text-transform:uppercase;opacity:0.9;">La Plena Eventos</div>
          <h1 style="margin:10px 0 0 0;font-size:28px;line-height:1.15;">${title}</h1>
        </div>

        <div style="padding:28px 24px;">
          <p style="margin:0 0 14px 0;font-size:18px;">Hola <strong>${nombre}</strong>,</p>
          <p style="margin:0 0 22px 0;font-size:16px;line-height:1.6;color:#7c2d12;">${intro}</p>

          <div style="margin-bottom:20px;">
            <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;margin-bottom:10px;">Tus boletas</div>
            <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:18px;padding:16px;">
              <div style="display:inline-block;background:#ffedd5;color:#c2410c;border-radius:999px;padding:10px 14px;font-size:22px;font-weight:800;letter-spacing:0.04em;">
                ${formatTicketNumbers(numeros)}
              </div>
            </div>
          </div>

          <p style="margin:0 0 8px 0;color:#9a3412;">Mucha suerte en la rifa.</p>
          <p style="margin:0;font-weight:700;color:#431407;">LA PLENA EVENTOS</p>
        </div>
      </div>
    </div>
  `;
}

export function renderPaidTicketsEmail(
  data: TicketEmailData
) {
  return renderBaseTemplate({
    title: 'Pago recibido con exito',
    intro:
      'Tu pago fue confirmado correctamente. Estas son las boletas pagadas asociadas a tu compra.',
    nombre: data.nombre,
    numeros: data.numeros,
  });
}

export function renderSoldOutEmail({
  totalBoletas,
}: {
  totalBoletas: number;
}) {
  return `
    <div style="background:#fff7ed;padding:32px 16px;font-family:Arial,sans-serif;color:#431407;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #fed7aa;border-radius:22px;overflow:hidden;box-shadow:0 18px 45px rgba(194,65,12,0.12);">
        <div style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 24px;color:#fff7ed;">
          <div style="font-size:12px;letter-spacing:0.14em;font-weight:700;text-transform:uppercase;opacity:0.9;">La Plena Eventos</div>
          <h1 style="margin:10px 0 0 0;font-size:28px;line-height:1.15;">Rifa vendida al 100%</h1>
        </div>

        <div style="padding:28px 24px;">
          <p style="margin:0 0 14px 0;font-size:18px;">Se completó la venta total de boletas.</p>
          <p style="margin:0 0 22px 0;font-size:16px;line-height:1.6;color:#7c2d12;">El sistema confirmó que ya no quedan boletas disponibles.</p>

          <div style="margin-bottom:20px;">
            <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;margin-bottom:10px;">Resumen</div>
            <div style="background:#fff7ed;border:1px solid #fdba74;border-radius:18px;padding:16px;">
              <div style="display:inline-block;background:#ffedd5;color:#c2410c;border-radius:999px;padding:10px 14px;font-size:22px;font-weight:800;letter-spacing:0.04em;">
                ${totalBoletas} boletas vendidas
              </div>
            </div>
          </div>

          <p style="margin:0;font-weight:700;color:#431407;">LA PLENA EVENTOS</p>
        </div>
      </div>
    </div>
  `;
}