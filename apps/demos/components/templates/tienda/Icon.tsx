/* ==========================================================================
   Plantilla Tienda — set de iconos SVG (línea, un color vía currentColor).
   Sin emojis. Estilo uniforme: viewBox 24, stroke 1.7, redondeado.
   ========================================================================== */

import type { ReactNode } from "react";

export type IconName =
  | "search"
  | "cart"
  | "user"
  | "menu"
  | "close"
  | "chevronDown"
  | "chevronRight"
  | "chevronLeft"
  | "plus"
  | "minus"
  | "trash"
  | "filter"
  | "truck"
  | "tag"
  | "star"
  | "check"
  | "clock"
  | "phone"
  | "shield"
  | "card"
  | "arrowRight"
  | "grid"
  | "leaf"
  | "bread"
  | "milk"
  | "can"
  | "bottle"
  | "spray";

const PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L21 8H6.2" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6 6 18" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  truck: (
    <>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4h7l9 9-7 7-9-9z" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </>
  ),
  star: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  phone: (
    <path d="M6 3h3l1.5 5-2 1.2a12 12 0 0 0 5.3 5.3l1.2-2 5 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3z" />
  ),
  shield: <path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />,
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14-1 0-1-1-1-1z" />
      <path d="M9 15c2-3 4-4.5 7-6" />
    </>
  ),
  bread: (
    <>
      <path d="M5 11a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3l-1.5 7a1.5 1.5 0 0 1-1.5 1.2H8a1.5 1.5 0 0 1-1.5-1.2z" />
      <path d="M9.5 8.5V19M14 8.5V19" />
    </>
  ),
  milk: (
    <>
      <path d="M8 3h8v3l1.5 3v10a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2V9L8 6z" />
      <path d="M6.5 11h11" />
    </>
  ),
  can: (
    <>
      <rect x="6" y="5" width="12" height="15" rx="2" />
      <path d="M6 9h12M9 5V3.5h6V5" />
    </>
  ),
  bottle: (
    <>
      <path d="M10 3h4v2.5l1.5 2.2V19a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V7.7L10 5.5z" />
      <path d="M9 12h6" />
    </>
  ),
  spray: (
    <>
      <path d="M10 8h5a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-9a2 2 0 0 1 2-2z" />
      <path d="M10 8V5h3M13 5l3-1M13 3l3 .5" />
    </>
  ),
};

export default function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.7,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
