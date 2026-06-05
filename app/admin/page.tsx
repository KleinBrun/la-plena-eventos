import { cookies } from 'next/headers';
import { db, ensureDBReady } from '@/lib/db';
import {
    ADMIN_SESSION_COOKIE,
    isAdminPasswordConfigured,
    isAdminSessionValid,
} from '@/lib/admin-auth';
import { getCurrentRaffleId } from '@/lib/raffle';

type SearchParams = Promise<{
    error?: string;
    correo?: string;
    numero?: string;
    rifa?: string;
}>;

type BoletaPagadaRow = {
    raffle_id: string | number;
    numero: string | number;
    nombre: string;
    telefono: string;
    correo: string;
    referencia: string;
    fecha: string;
};

export default async function AdminPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const raffleIdFromEnv = getCurrentRaffleId();
    const raffleIdFromQuery = Number(
        params.rifa ?? raffleIdFromEnv
    );
    const raffleId =
        Number.isFinite(raffleIdFromQuery) &&
        raffleIdFromQuery > 0
            ? Math.trunc(raffleIdFromQuery)
            : raffleIdFromEnv;

    const cookieStore = await cookies();
    const isAuthenticated =
        isAdminSessionValid(
            cookieStore.get(ADMIN_SESSION_COOKIE)
                ?.value
        );

    if (!isAdminPasswordConfigured()) {
        return (
            <main
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '24px',
                    background: '#7c2d12',
                    color: '#fff7ed',
                }}
            >
                <section
                    style={{
                        maxWidth: '560px',
                        borderRadius: '20px',
                        background: '#9a3412',
                        padding: '28px',
                        border: '1px solid #fdba74',
                    }}
                >
                    <h1 style={{ marginTop: 0 }}>
                        Panel privado no configurado
                    </h1>
                    <p>
                        Agrega la variable ADMIN_PANEL_PASSWORD en tu archivo .env para habilitar este acceso.
                    </p>
                </section>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '24px',
                    background:
                        'linear-gradient(160deg, #7c2d12 0%, #9a3412 55%, #c2410c 100%)',
                }}
            >
                <section
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                        borderRadius: '24px',
                        background: 'rgba(124, 45, 18, 0.84)',
                        padding: '28px',
                        border: '1px solid rgba(253, 186, 116, 0.35)',
                        boxShadow:
                            '0 24px 70px rgba(0, 0, 0, 0.35)',
                        color: '#fff7ed',
                    }}
                >
                    <p
                        style={{
                            margin: '0 0 8px 0',
                            color: '#fdba74',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontSize: '12px',
                        }}
                    >
                        Acceso privado
                    </p>
                    <h1
                        style={{
                            marginTop: 0,
                            marginBottom: '10px',
                            fontSize: '32px',
                        }}
                    >
                        Panel de boletas vendidas
                    </h1>

                    <form
                        action="/admin/login"
                        method="post"
                    >
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            required
                            style={{
                                width: '100%',
                                marginTop: '12px',
                                padding: '14px 16px',
                                borderRadius: '14px',
                                border: '1px solid #fdba74',
                                background: '#7c2d12',
                                color: '#fff7ed',
                                fontSize: '16px',
                                boxSizing: 'border-box',
                            }}
                        />

                        {params.error === '1' && (
                            <p
                                style={{
                                    color: '#ffedd5',
                                    marginTop: '12px',
                                    marginBottom: 0,
                                }}
                            >
                                Contraseña incorrecta.
                            </p>
                        )}

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                marginTop: '18px',
                                border: 'none',
                                borderRadius: '14px',
                                padding: '14px 16px',
                                background:
                                    'linear-gradient(135deg, #fdba74 0%, #f97316 100%)',
                                color: '#7c2d12',
                                fontWeight: 700,
                                fontSize: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            Entrar
                        </button>
                    </form>
                </section>
            </main>
        );
    }

        await ensureDBReady();

        const result = await db.execute({
                sql: `
                    SELECT raffle_id, numero, nombre, telefono, correo, referencia, fecha
                    FROM boletas
                    WHERE estado = 'PAGADO'
                    AND raffle_id = ?
                    ORDER BY fecha DESC, numero ASC
                `,
                args: [raffleId],
        });
    const correoFiltro =
        params.correo?.trim().toLowerCase() ?? '';
    const numeroFiltro =
        params.numero?.trim() ?? '';

    const boletas = (
        result.rows as BoletaPagadaRow[]
    ).map((row) => ({
        ...row,
        numero: Number(row.numero),
    }));

    const boletasFiltradas = boletas.filter(
        (boleta) => {
            const coincideCorreo =
                !correoFiltro ||
                boleta.correo
                    .toLowerCase()
                    .includes(correoFiltro);
            const coincideNumero =
                !numeroFiltro ||
                String(boleta.numero).includes(
                    numeroFiltro
                );

            return (
                coincideCorreo && coincideNumero
            );
        }
    );

    const totalCorreosUnicos =
        new Set(
            boletasFiltradas.map((boleta) =>
                boleta.correo.toLowerCase()
            )
        ).size;

    return (
        <main
            style={{
                minHeight: '100vh',
                padding: '32px 20px 60px',
                background: '#fff7ed',
                color: '#431407',
            }}
        >
            <div
                style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        marginBottom: '24px',
                    }}
                >
                    <div>
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
                            Panel privado
                        </p>
                        <h1
                            style={{
                                margin: '8px 0 6px 0',
                                fontSize: '34px',
                            }}
                        >
                            Boletas vendidas
                        </h1>
                        <p
                            style={{
                                margin: 0,
                                color: '#9a3412',
                            }}
                        >
                            Rifa activa: {raffleIdFromEnv} · Mostrando rifa: {raffleId}
                        </p>
                    </div>

                    <form
                        action="/admin/logout"
                        method="post"
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <a
                                href="/admin/email-preview"
                                style={{
                                    border: '1px solid #fdba74',
                                    background: '#fff7ed',
                                    color: '#9a3412',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                }}
                            >
                                Ver correos
                            </a>

                            <button
                                type="submit"
                                style={{
                                    border: '1px solid #fdba74',
                                    background: '#fff7ed',
                                    color: '#9a3412',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </form>
                </div>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '14px',
                        marginBottom: '24px',
                    }}
                >
                    <article
                        style={{
                            background: '#fffaf5',
                            borderRadius: '18px',
                            padding: '18px',
                            border: '1px solid #fed7aa',
                        }}
                    >
                        <div
                            style={{
                                color: '#9a3412',
                                fontSize: '13px',
                            }}
                        >
                            Boletas encontradas
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                fontWeight: 800,
                                marginTop: '8px',
                            }}
                        >
                            {boletasFiltradas.length}
                        </div>
                    </article>

                    <article
                        style={{
                            background: '#fffaf5',
                            borderRadius: '18px',
                            padding: '18px',
                            border: '1px solid #fed7aa',
                        }}
                    >
                        <div
                            style={{
                                color: '#9a3412',
                                fontSize: '13px',
                            }}
                        >
                            Correos únicos
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                fontWeight: 800,
                                marginTop: '8px',
                            }}
                        >
                            {totalCorreosUnicos}
                        </div>
                    </article>

                    <article
                        style={{
                            background: '#fffaf5',
                            borderRadius: '18px',
                            padding: '18px',
                            border: '1px solid #fed7aa',
                        }}
                    >
                        <div
                            style={{
                                color: '#9a3412',
                                fontSize: '13px',
                            }}
                        >
                            Boletas pagadas
                        </div>
                        <div
                            style={{
                                fontSize: '30px',
                                fontWeight: 800,
                                marginTop: '8px',
                            }}
                        >
                            {boletasFiltradas.length}
                        </div>
                    </article>
                </section>

                <section
                    style={{
                        marginBottom: '18px',
                        background: '#fffaf5',
                        borderRadius: '20px',
                        padding: '16px',
                        border: '1px solid #fed7aa',
                    }}
                >
                    <form
                        method="get"
                        action="/admin"
                        style={{
                            display: 'grid',
                            gap: '10px',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(220px, 1fr))',
                        }}
                    >
                        <input
                            type="number"
                            min={1}
                            step={1}
                            name="rifa"
                            defaultValue={String(raffleId)}
                            placeholder="Filtrar por rifa"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: '1px solid #fdba74',
                                background: '#fff7ed',
                                color: '#7c2d12',
                                boxSizing: 'border-box',
                            }}
                        />

                        <input
                            type="text"
                            name="correo"
                            defaultValue={params.correo ?? ''}
                            placeholder="Filtrar por correo"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: '1px solid #fdba74',
                                background: '#fff7ed',
                                color: '#7c2d12',
                                boxSizing: 'border-box',
                            }}
                        />

                        <input
                            type="text"
                            name="numero"
                            inputMode="numeric"
                            defaultValue={params.numero ?? ''}
                            placeholder="Filtrar por número de boleta"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: '1px solid #fdba74',
                                background: '#fff7ed',
                                color: '#7c2d12',
                                boxSizing: 'border-box',
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                type="submit"
                                style={{
                                    border: '1px solid #fdba74',
                                    background: '#f97316',
                                    color: '#fff7ed',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                }}
                            >
                                Filtrar
                            </button>

                            <a
                                href="/admin"
                                style={{
                                    border: '1px solid #fdba74',
                                    background: '#fff7ed',
                                    color: '#9a3412',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                }}
                            >
                                Limpiar filtros
                            </a>
                        </div>
                    </form>
                </section>

                <section
                    style={{
                        display: 'grid',
                        gap: '16px',
                    }}
                >
                    {boletasFiltradas.length === 0 ? (
                        <article
                            style={{
                                background: '#fffaf5',
                                borderRadius: '20px',
                                padding: '24px',
                                border: '1px solid #fed7aa',
                                color: '#9a3412',
                            }}
                        >
                            No hay boletas pagadas para ese filtro.
                        </article>
                    ) : (
                        <article
                            style={{
                                background: '#fffaf5',
                                borderRadius: '20px',
                                padding: '22px',
                                border: '1px solid #fed7aa',
                                boxShadow:
                                    '0 8px 24px rgba(194, 65, 12, 0.1)',
                            }}
                        >
                            <div
                                style={{
                                    overflowX: 'auto',
                                    borderRadius: '14px',
                                    border: '1px solid #fed7aa',
                                }}
                            >
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        minWidth: '980px',
                                    }}
                                >
                                    <thead
                                        style={{
                                            background: '#ffedd5',
                                            color: '#9a3412',
                                        }}
                                    >
                                        <tr>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Número boleta
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Rifa
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Correo
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Nombre
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Teléfono
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Referencia
                                            </th>
                                            <th
                                                style={{
                                                    textAlign: 'left',
                                                    padding: '12px 14px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Fecha
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {boletasFiltradas.map((boleta, index) => (
                                            <tr
                                                key={`${boleta.referencia}-${boleta.numero}`}
                                                style={{
                                                    background:
                                                        index % 2 === 0 ? '#fffaf5' : '#fff7ed',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#c2410c',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {boleta.numero}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#9a3412',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {Number(boleta.raffle_id)}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#7c2d12',
                                                    }}
                                                >
                                                    {boleta.correo}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#431407',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {boleta.nombre}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#7c2d12',
                                                    }}
                                                >
                                                    {boleta.telefono}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#7c2d12',
                                                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                                    }}
                                                >
                                                    {boleta.referencia}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderTop: '1px solid #ffedd5',
                                                        color: '#7c2d12',
                                                    }}
                                                >
                                                    {boleta.fecha}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    )}
                </section>
            </div>
        </main>
    );
}