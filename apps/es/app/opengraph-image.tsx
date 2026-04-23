import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Enrique Becerra — Desarrollo web para autónomos y PYMEs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#1c1917",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 6,
            height: "100%",
            background: "#047857",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 80,
            fontFamily: "serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#fafaf9",
            letterSpacing: "-0.02em",
            opacity: 0.6,
          }}
        >
          eB
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              letterSpacing: "0.12em",
              color: "#047857",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            ebecerra.es
          </p>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#fafaf9",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Enrique Becerra
          </h1>
          <p
            style={{
              fontSize: 24,
              color: "#a8a29e",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Desarrollo web profesional para autónomos y PYMEs
          </p>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
