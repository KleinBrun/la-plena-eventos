'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function Home() {
  const valorBoleta = 1000;

  const tickets = [
    {
      id: 1,
      nombre: '🎟️ TICKET 2 BOLETAS',
      cantidad: 2,
      valor: 2 * valorBoleta,
    },
    {
      id: 2,
      nombre: '🎟️ TICKET 3 BOLETAS',
      cantidad: 3,
      valor: 3 * valorBoleta,
    },
    {
      id: 3,
      nombre: '🎟️ TICKET 5 BOLETAS',
      cantidad: 5,
      valor: 5 * valorBoleta,
    },
    {
      id: 4,
      nombre: '🎟️ TICKET 7 BOLETAS',
      cantidad: 7,
      valor: 7 * valorBoleta,
    },
  ];

  const [ticketSeleccionado, setTicketSeleccionado] =
    useState<any>(null);
  const ticketsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] =
    useState('');

  const [telefono, setTelefono] =
    useState('');

  const [correo, setCorreo] =
    useState('');
  const [mostrarModal, setMostrarModal] =
    useState(false);

  const inputStyle = {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    fontSize: '16px',
    outline: 'none',
  };

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

    const referencia = `RIFA-${Date.now()}`;

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

    let data;

    try {
      data = JSON.parse(texto);
    } catch (error) {
      console.error('La API no devolvió JSON');
      console.error(texto);
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
            color: 'white',
            fontSize: '28px',
            fontWeight: '600',
          }}
        >
          SILLA DE VAQUERÍA + ALFOMBRA
        </p>

        <p
          style={{
            color: 'white',
            fontSize: '20px',
          }}
        >
          Valor por boleta:
          {' '}
          $5.000
        </p>
      </div>

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
              padding: '35px',
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