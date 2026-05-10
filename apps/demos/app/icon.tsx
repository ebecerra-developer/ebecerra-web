import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon raíz del subdominio demos.ebecerra.es. Glifo `e` del monograma
 * eB en cream sobre verde bosque (acento de apps/es). Es el fallback
 * cuando no hay slug en la URL — cada `/[locale]/[slug]` lo override
 * con el accentColor de la demo.
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
          background: "#047857",
        }}
      >
        <svg
          viewBox="-14 155 700 700"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#f7f0e3"
            d="M282.191,648.647c-68.834,16.216-117.715,24.524-135.641-13.292c-6.553-16.024-5.559-34.737-5.518-34.737c0,0-107.316,0.183-108.768,0.063c-2.181,36.196-7.278,76.347,30.681,123.011c77.005,94.663,285.46,5.886,388.53-22.995c1.803-17.102-9.025-81.229-13.832-105.208C398.435,611.371,350.756,631.319,282.191,648.647z"
          />
          <path
            fill="#f7f0e3"
            d="M108.188,542.575c28.87,0,47.039,0,47.04-0.003h178.419c23.59,0,41.926,0.23,62.413-5.759c16.459-4.821,47.748-22.121,53.078-54.396c2.367-14.309,0.417-31.254-0.907-43.621c-2.743-25.891-5.746-33.943-16.597-60.538c-16.412-40.292-42.132-61.433-77.615-79.063c-31.971-15.917-70.542-13.574-114.454-13.574c-46.813,0.001-61.06-0.069-100.924,1.723c-65.219,2.928-120.578,38.297-121.747,102.224c-0.688,34.435,3.897,66.825,9.531,93.076C33.597,515.582,50.366,542.575,108.188,542.575z"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
