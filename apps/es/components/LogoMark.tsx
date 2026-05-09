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
  const heightValue = typeof height === "number" ? `${height}px` : height;
  return (
    // SVG estático sin dimensiones intrínsecas conocidas y servido desde /public.
    // next/image no aporta optimización aquí (no rasteriza SVG) y exigiría width/height
    // fijos por variante, lo que rompería el escalado por height prop.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt={alt}
      height={typeof height === "number" ? height : undefined}
      className={className ? `${styles.logoMark} ${className}` : styles.logoMark}
      style={{ height: heightValue }}
    />
  );
}
