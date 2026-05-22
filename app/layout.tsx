import './globals.css'
import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <nav
          style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            backdropFilter: 'blur(8px)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 'bold' }}>LA PLENA EVENTOS</h2>
          <div style={{ display: 'flex', gap: 20, fontWeight: 'bold' }}>
            <Link href="/">Inicio</Link>
            <Link href="/rifa">Rifa</Link>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
