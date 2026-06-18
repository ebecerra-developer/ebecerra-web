/**
 * Iconos de línea fina propios de la plantilla gestoría. Trazo currentColor,
 * geométricos y sobrios (nada de clipart ni emojis). Server component.
 */
type IconKey =
  | "fiscal"
  | "laboral"
  | "contable"
  | "mercantil"
  | "autonomo"
  | "empresa"
  | "herencia"
  | "extranjeria"
  | "trafico"
  | "shield"
  | "clock"
  | "doc"
  | "phone"
  | "chat"
  | "play"
  | "pause"
  | "check";

const PATHS: Record<IconKey, React.ReactNode> = {
  fiscal: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  laboral: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </>
  ),
  contable: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 18h2" />
    </>
  ),
  mercantil: (
    <>
      <path d="M12 3l8 4v3H4V7l8-4z" />
      <path d="M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16" />
    </>
  ),
  autonomo: (
    <>
      <path d="M3 8l9-5 9 5-9 5-9-5z" />
      <path d="M7 11v5c0 1.3 2.2 2.5 5 2.5s5-1.2 5-2.5v-5" />
    </>
  ),
  empresa: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="1.5" />
      <path d="M9 20v-5h6v5M8 10h.01M12 10h.01M16 10h.01" />
    </>
  ),
  herencia: (
    <>
      <path d="M12 21s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 3.5C19 16.6 12 21 12 21z" />
    </>
  ),
  extranjeria: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" />
    </>
  ),
  trafico: (
    <>
      <path d="M5 16l1.5-5h11L19 16M5 16h14M5 16v2.5M19 16v2.5" />
      <circle cx="8" cy="16" r="1.4" />
      <circle cx="16" cy="16" r="1.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.2 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.2v3a1.6 1.6 0 0 1-1.7 1.6C12.4 21 3 11.6 2.9 5.2A1.6 1.6 0 0 1 4.5 3.5z" />
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  play: <path d="M7 5l12 7-12 7z" />,
  pause: (
    <>
      <path d="M8 5v14M16 5v14" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
};

export default function GestoriaIcon({
  name,
  className,
}: {
  name: IconKey;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
