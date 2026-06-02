import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'La Plena Eventos',
  description: 'Eventos y rifas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        
        <main>{children}</main>
      </body>
    </html>
  );
}
