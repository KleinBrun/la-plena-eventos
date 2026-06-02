export default function Home() {
const numeros = Array.from(
{ length: 300 },
(_, i) => String(i + 1).padStart(3, "0")
);

return (
<main
style={{
minHeight: "100vh",
background:
'#FF3B01',
fontFamily: "Arial, sans-serif",
}}
>
{/* NAVBAR */}
<nav
style={{
backgroundColor: "rgba(0,0,0,0.2)",
padding: "20px 40px",
display: "flex",
justifyContent: "space-between",
alignItems: "center",
color: "white",
backdropFilter: "blur(10px)",
}}
>
<h2
style={{
margin: 0,
fontSize: "28px",
fontWeight: "bold",
}}
>
LA PLENA EVENTOS </h2>

    <div
      style={{
        display: "flex",
        gap: "30px",
        fontSize: "18px",
        fontWeight: "bold",
      }}
    >
      <span style={{ cursor: "pointer" }}>Inicio</span>
      <span style={{ cursor: "pointer" }}>
        Cómo participar
      </span>
    </div>
  </nav>

  {/* CONTENIDO */}
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "40px",
    }}
  >
    <h1
      style={{
        textAlign: "center",
        color: "white",
        fontSize: "50px",
        fontWeight: "bold",
        marginBottom: "10px",
      }}
    >
      RIFA OFICIAL
    </h1>

    <p
      style={{
        textAlign: "center",
        color: "white",
        fontSize: "20px",
        marginBottom: "40px",
      }}
    >
      Silla de Caballo + Alfombra
    </p>

    {/* NUMEROS */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(90px, 1fr))",
        gap: "15px",
      }}
    >
      {numeros.map((numero) => (
        <div
          key={numero}
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "25px 10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "24px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            cursor: "pointer",
          }}
        >
          {numero}
        </div>
      ))}
    </div>

    {/* BOTON */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "50px",
  }}
>
  <a
    href="https://checkout.wompi.co/l/VPOS_MPHBoe"
    target="_blank"
    style={{
      backgroundColor: "black",
      color: "white",
      textDecoration: "none",
      padding: "18px 40px",
      borderRadius: "15px",
      fontSize: "18px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    PAGAR CON WOMPI
  </a>
</div>
