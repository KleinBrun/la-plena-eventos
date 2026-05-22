import Link from 'next/link'

export default function Inicio() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', color: 'white', padding: 40 }}>
        <h1 style={{ fontSize: 48, marginBottom: 10 }}>Bienvenido a La Plena Eventos</h1>
        <p style={{ fontSize: 18, marginBottom: 30 }}>Participa en nuestra rifa oficial — silla de caballo + alfombra.</p>
        <Link href="/rifa">
          <button
            style={{
              background: 'black',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Ir a la rifa
          </button>
        </Link>
      </div>
    </main>
  )
}
