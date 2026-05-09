import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon del subdominio demos.ebecerra.es.
 * Símbolo neutral coherente con la paleta del template fisio:
 * fondo petrol blue + círculo cream centrado. No representa una demo
 * concreta. Cuando aparezcan demos con marca propia, añadiremos
 * brand.favicon en schema y este será el fallback.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e5f6e",
        }}
      >
        <div
          style={{
            width: "44%",
            height: "44%",
            borderRadius: "50%",
            background: "#f7f0e3",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
