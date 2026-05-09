import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          background: "#fdfaf5",
          color: "#2c3e2e",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <main>
          <p style={{ fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a8377", margin: 0 }}>
            404
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 1rem" }}>Demo no encontrada</h1>
          <p style={{ marginBottom: "2rem", color: "#4a5a4c" }}>
            Esta URL no existe o la demo se ha despublicado.
          </p>
          <Link
            href="https://ebecerra.es/ejemplos"
            style={{
              display: "inline-block",
              background: "#5b8c6a",
              color: "#fdfaf5",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Ver todas las demos
          </Link>
        </main>
      </body>
    </html>
  );
}
