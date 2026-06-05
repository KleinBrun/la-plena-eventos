'use client';

import {
  useState,
  useEffect,
  useRef,
  useEffectEvent,
  useMemo,
} from 'react';
import SHA256 from 'crypto-js/sha256';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: [
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
  ],
});

const BASE_TICKET_CANTIDADES = [2, 3, 5, 7];

export default function Home() {
  const TOTAL_BOLETAS = Number(
    process.env
      .NEXT_PUBLIC_TOTAL_BOLETAS ?? 700
  );
  const valorBoleta = Number(
    process.env
      .NEXT_PUBLIC_VALOR_BOLETA ?? 5000
  );
  const premioRifa =
    process.env
      .NEXT_PUBLIC_PREMIO_RIFA ??
    'SILLA DE VAQUERÍA + ALFOMBRA';
  const raffleId = Number(
    process.env.NEXT_PUBLIC_RAFFLE_ID ?? 1
  );

  type Ticket = {
    id: number;
    nombre: string;
    cantidad: number;
    valor: number;
  };

  type Progreso = {
    total: number;
    vendidas: number;
    porcentaje: number;
    restantes: number;
  };

  const [ticketSeleccionado, setTicketSeleccionado] =
    useState<Ticket | null>(null);
  const ticketsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [progreso, setProgreso] =
    useState<Progreso>({
      total: TOTAL_BOLETAS,
      vendidas: 0,
      porcentaje: 0,
      restantes: TOTAL_BOLETAS,
    });
  const [nombre, setNombre] =
    useState('');

  const [telefono, setTelefono] =
    useState('');

  const [correo, setCorreo] =
    useState('');
  const [mostrarModal, setMostrarModal] =
    useState(false);

  const tickets = useMemo<Ticket[]>(() => {
    const restantes = Math.max(
      progreso.restantes,
      0
    );

    if (restantes === 0) {
      return [];
    }

    const cantidadesAjustadas =
      BASE_TICKET_CANTIDADES.map((cantidad) =>
        Math.min(cantidad, restantes)
      );

    const cantidadesUnicas =
      Array.from(new Set(cantidadesAjustadas));

    if (
      restantes === 1 &&
      !cantidadesUnicas.includes(1)
    ) {
      cantidadesUnicas.unshift(1);
    }

    return cantidadesUnicas.map((cantidad) => ({
      id: cantidad,
      nombre: `🎟️ TICKET ${cantidad} BOLETA${cantidad === 1 ? '' : 'S'}`,
      cantidad,
      valor: cantidad * valorBoleta,
    }));
  }, [progreso.restantes, valorBoleta]);

  const inputStyle = {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const obtenerProgreso = async () => {
    try {
      const res = await fetch('/api/progreso', {
        cache: 'no-store',
      });

      if (!res.ok) {
        return null;
      }

      return (await res.json()) as Progreso;
    } catch {
      return null;
    }
  };

  const cargarProgreso = useEffectEvent(async () => {
    const data = await obtenerProgreso();

    if (!data) {
      return;
    }

    setProgreso(data);
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void cargarProgreso();
    }, 0);

    const intervalId = setInterval(
      () => {
        void cargarProgreso();
      },
      15000
    );

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // useEffect(() => {
  //   const handleClickOutside = (
  //     event: MouseEvent
  //   ) => {
  //     const target = event.target as Node;

  //     const clickEnTickets =
  //       ticketsRef.current?.contains(target);

  //     const clickEnModal =
  //       modalRef.current?.contains(target);

  //     if (
  //       !clickEnTickets &&
  //       !clickEnModal
  //     ) {
  //       setTicketSeleccionado(null);
  //       setMostrarModal(false);
  //     }
  //   };

  //   document.addEventListener(
  //     'mousedown',
  //     handleClickOutside
  //   );

  //   return () => {
  //     document.removeEventListener(
  //       'mousedown',
  //       handleClickOutside
  //     );
  //   };
  // }, []);
  const pagarConWompi = async () => {
    if (!ticketSeleccionado) return;

    if (
      !nombre ||
      !telefono ||
      !correo
    ) {
      alert(
        'Complete todos los datos'
      );
      return;
    }

    const referencia = `RIFA-${raffleId}-${Date.now()}`;

    const response = await fetch(
      '/api/reservar',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          cantidad:
            ticketSeleccionado.cantidad,
          nombre,
          telefono,
          correo,
          referencia,
        }),
      }
    );

    const texto = await response.text();

    console.log('RESPUESTA API:');
    console.log(texto);

    let data: { error?: string } | null = null;

    try {
      data = JSON.parse(texto) as {
        error?: string;
      };
    } catch {
      console.error('La API no devolvió JSON');
      console.error(texto);
      return;
    }

    if (!response.ok) {
      alert(
        data?.error ??
          'No se pudo reservar la compra.'
      );
      return;
    }

    const montoCentavos =
      ticketSeleccionado.valor *
      100;

    const moneda = 'COP';

    const integritySecret =
      process.env
        .NEXT_PUBLIC_WOMPI_INTEGRITY_SECRET!;

    const publicKey =
      process.env
        .NEXT_PUBLIC_WOMPI_PUBLIC_KEY!;

    const firma = SHA256(
      `${referencia}${montoCentavos}${moneda}${integritySecret}`
    ).toString();
    console.log('REFERENCIA', referencia);
    const url = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${moneda}&amount-in-cents=${montoCentavos}&reference=${referencia}&signature:integrity=${firma}`;
    setMostrarModal(false);

    window.open(url, '_blank');
  };

  return (
    <main
      className={poppins.className}
      style={{
        minHeight: '100vh',
        background: '#FF3B01',
        padding: '30px',
      }}
    >
      {/* LOGO */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '50px',
        }}
      >
        <img
          src="/logo.JPG"
          alt="Logo"
          style={{
            width: '280px',
            marginBottom: '20px',
          }}
        />

        <h1
          style={{
            color: 'white',
            fontSize: '58px',
            fontWeight: '900',
            margin: 0,
          }}
        >
          LA PLENA
        </h1>

        <p
          style={{
            display: 'inline-block',
            color: '#8a4b00',
            fontSize: '30px',
            fontWeight: '800',
            letterSpacing: '0.8px',
            margin: '14px auto 0 auto',
            padding: '14px 24px',
            borderRadius: '999px',
            background:
              'radial-gradient(circle at top, #fffdf8 0%, #ffffff 50%, #fff6db 100%)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow:
              '0 0 0 3px rgba(255, 240, 196, 0.25), 0 10px 28px rgba(255, 214, 122, 0.35), 0 0 22px rgba(255, 244, 208, 0.8)',
            textTransform: 'uppercase',
            textShadow: '0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {premioRifa}
        </p>

        <p
          style={{
            color: 'white',
            fontSize: '20px',
          }}
        >
          Valor por boleta:
          {' '}
          ${valorBoleta.toLocaleString('es-CO')}
        </p>
      </div>

      <section
        style={{
          maxWidth: '900px',
          margin: '0 auto 40px auto',
          padding: '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            color: '#e9fbff',
            fontWeight: 700,
            marginBottom: '12px',
            gap: '10px',
            flexWrap: 'wrap',
            fontSize: '20px',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              letterSpacing: '0.5px',
            }}
          >
            {progreso.porcentaje}%
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '18px',
            borderRadius: '999px',
            background: '#ffffff',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.55)',
          }}
        >
          <div
            style={{
              width: `${progreso.porcentaje}%`,
              height: '100%',
              background:
                'linear-gradient(110deg, #29b6f6 0%, #1e88e5 35%, #42a5f5 60%, #1565c0 100%)',
              transition: 'width 0.65s ease-out',
              boxShadow: '0 0 8px rgba(41, 182, 246, 0.28)',
              position: 'relative',
              overflow: 'hidden',
              animation:
                progreso.porcentaje < 100
                  ? 'barraVendida 3.2s ease-in-out infinite'
                  : 'none',
            }}
          >
            {progreso.porcentaje < 100 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-40%',
                  width: '40%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0) 100%)',
                  animation:
                    'reflejoCarga 1.8s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* TICKETS */}
      <div ref={ticketsRef}
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '25px',
        }}
      >
        {tickets.map((ticket) => {
          const activo =
            ticketSeleccionado?.id ===
            ticket.id;

          return (
            <div
              key={ticket.id}
              onClick={() => {
                setTicketSeleccionado(ticket);
                setMostrarModal(true);
              }}
              style={{
                background: activo
                  ? '#000'
                  : '#fff',

                color: activo
                  ? '#fff'
                  : '#111',

                borderRadius: '30px',

                padding: '35px',

                textAlign: 'center',

                cursor: 'pointer',

                transition: '0.3s',

                boxShadow:
                  '0 15px 35px rgba(0,0,0,0.15)',

                border: activo
                  ? '3px solid white'
                  : '3px solid transparent',
              }}
            >
              <h2
                style={{
                  marginBottom: '15px',
                  fontSize: '26px',
                }}
              >
                {ticket.nombre}
              </h2>

              <p
                style={{
                  fontSize: '20px',
                }}
              >
                {ticket.cantidad} Boletas
              </p>

              <h3
                style={{
                  fontSize: '38px',
                  marginTop: '20px',
                  fontWeight: '900',
                }}
              >
                $
                {ticket.valor.toLocaleString(
                  'es-CO'
                )}
              </h3>
            </div>
          );
        })}

        {tickets.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: '#fff',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '18px',
              padding: '22px',
              fontWeight: 700,
            }}
          >
            No hay boletas disponibles en este momento.
          </div>
        )}
      </div>

      {mostrarModal && (
        <div
          onClick={() => {
            setMostrarModal(false);
            setTicketSeleccionado(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '500px',
              borderRadius: '25px',
              padding: '30px',
            }}
          >
            <h2
              style={{
                textAlign: 'center',
                marginBottom: '25px',
                fontSize: '28px',
              }}
            >
              Datos del participante
            </h2>

            <input
              style={inputStyle}
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
            />

            <input
              style={inputStyle}
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value)
              }
            />

            <input
              style={inputStyle}
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
            />

            <div
              style={{
                background: '#f4f4f4',
                padding: '15px',
                borderRadius: '15px',
                marginTop: '15px',
              }}
            >
              <strong>
                {ticketSeleccionado?.nombre}
              </strong>

              <br />

              Total:
              {' '}
              $
              {ticketSeleccionado?.valor.toLocaleString(
                'es-CO'
              )}
            </div>

            <button
              onClick={pagarConWompi}
              style={{
                width: '100%',
                marginTop: '20px',
                background: '#FF3B01',
                color: '#fff',
                border: 'none',
                padding: '18px',
                borderRadius: '15px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              PAGAR CON WOMPI
            </button>

            <button
              onClick={() => {
                setMostrarModal(false);
                setTicketSeleccionado(null);
              }}
              style={{
                width: '100%',
                marginTop: '10px',
                background: '#eee',
                border: 'none',
                padding: '15px',
                borderRadius: '15px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}