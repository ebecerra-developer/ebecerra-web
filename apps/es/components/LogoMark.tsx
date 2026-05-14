import styles from "./LogoMark.module.css";

type Variant =
  | "primary"
  | "accent"
  | "negative"
  | "icon"
  | "scaleDeep"
  | "scaleBalanced";

const SRC: Record<Variant, string> = {
  primary: "/brand/logo-black.svg",
  accent: "/brand/logo-green.svg",
  negative: "/brand/logo-white.svg",
  icon: "/icon0.svg",
  scaleDeep: "/brand/logo-scale-deep.svg",
  scaleBalanced: "/brand/logo-scale-balanced.svg",
};

// Ratios intrínsecos (viewBox de cada SVG) para reservar espacio y evitar CLS.
const ASPECT: Record<Variant, number> = {
  primary: 1024 / 768,
  accent: 1024 / 768,
  negative: 1024 / 768,
  icon: 1,
  scaleDeep: 1024 / 768,
  scaleBalanced: 1024 / 768,
};

type Props = {
  variant?: Variant;
  height?: number | string;
  className?: string;
  alt?: string;
};

export default function LogoMark({
  variant = "primary",
  height = 32,
  className,
  alt = "eBecerra",
}: Props) {
  const ratio = ASPECT[variant];
  const isNumericHeight = typeof height === "number";
  // Atributos HTML width/height son hints presentacionales: el navegador los usa
  // para reservar espacio (evita CLS) y CSS puede sobrescribirlos sin problema.
  const intrinsicHeight = isNumericHeight ? height : 1024 / ratio; // 768 si ratio 4/3
  const intrinsicWidth = Math.round(Number(intrinsicHeight) * ratio);
  return (
    // SVG estático servido desde /public. next/image no rasteriza SVG.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt={alt}
      width={intrinsicWidth}
      height={Math.round(Number(intrinsicHeight))}
      className={className ? `${styles.logoMark} ${className}` : styles.logoMark}
      style={isNumericHeight ? { height: `${height}px`, width: "auto" } : { aspectRatio: `${ratio}` }}
    />
  );
}
