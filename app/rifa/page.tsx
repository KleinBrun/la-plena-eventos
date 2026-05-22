export default function Rifa() {
const numeros = Array.from(
{ length: 300 },
(_, i) => String(i + 1).padStart(3, "0")
);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '50px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          RIFA OFICIAL
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '20px',
            marginBottom: '40px',
          }}
        >
          Silla de Caballo + Alfombra
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
            gap: '15px',
          }}
        >
          {numeros.map((numero) => (
            <div
              key={numero}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px 10px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '24px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
            >
              {numero}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '50px',
          }}
        >
          <button
            style={{
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            PAGAR CON WOMPI
          </button>
        </div>
      </div>
    </main>
  );
}
