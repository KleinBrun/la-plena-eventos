import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  renderPaidTicketsEmail,
  renderSoldOutEmail,
} from '@/lib/email-templates';
import {
  ADMIN_SESSION_COOKIE,
  isAdminSessionValid,
} from '@/lib/admin-auth';

export default async function AdminEmailPreviewPage() {
  const cookieStore = await cookies();
  const isAuthenticated = isAdminSessionValid(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  );

  if (!isAuthenticated) {
    redirect('/admin');
  }

  const sampleData = {
    nombre: 'Nelson',
    numeros: [12, 87, 143, 266],
  };

  const totalBoletas = Number(
    process.env.TOTAL_BOLETAS ??
      process.env.NEXT_PUBLIC_TOTAL_BOLETAS ??
      700
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fff7ed',
        padding: '32px 20px 60px',
        color: '#431407',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '14px' }}>
          <a
            href="/admin"
            style={{
              border: '1px solid #fdba74',
              background: '#fffaf5',
              color: '#9a3412',
              padding: '10px 14px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Volver al admin
          </a>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              margin: 0,
              color: '#ea580c',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontSize: '12px',
            }}
          >
            Vista previa local
          </p>
          <h1 style={{ margin: '8px 0 6px 0' }}>
            Correos del sistema
          </h1>
          <p style={{ margin: 0, color: '#9a3412' }}>
            Vista previa de los dos correos activos: pago aprobado y venta total.
          </p>
        </div>

        <section style={{ display: 'grid', gap: '18px' }}>
          <article
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid #fed7aa',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #fed7aa',
                background: '#fffaf5',
                color: '#9a3412',
                fontWeight: 700,
              }}
            >
              Correo: pago aprobado
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: renderPaidTicketsEmail(sampleData),
              }}
            />
          </article>

          <article
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid #fed7aa',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid #fed7aa',
                background: '#fffaf5',
                color: '#9a3412',
                fontWeight: 700,
              }}
            >
              Correo: venta total
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: renderSoldOutEmail({
                  totalBoletas,
                }),
              }}
            />
          </article>
        </section>
      </div>
    </main>
  );
}