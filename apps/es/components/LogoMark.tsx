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
  return (
    <img
      src={SRC[variant]}
      alt={alt}
      height={typeof height === "number" ? height : undefined}
      className={className}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: "auto",
        display: "block",
      }}
    />
  );
}
