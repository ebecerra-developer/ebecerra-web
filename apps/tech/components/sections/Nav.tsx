"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

const NAV_IDS = [
  { id: "inicio", key: "home" },
  { id: "sobre-mí", key: "about" },
  { id: "experiencia", key: "experience" },
  { id: "skills", key: "skills" },
  { id: "proyectos", key: "projects" },
  { id: "contacto", key: "contact" },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#00ff88"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LangSwitch({ align = "right" }: { align?: "left" | "right" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 bg-transparent border-none text-white text-[13px] font-mono tracking-[0.05em] uppercase px-2 py-1.5 rounded hover:text-[#00ff88] transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        <GlobeIcon size={14} />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+6px)] min-w-[160px] bg-[#0d0d0d] border border-[#2a2a2a] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-1 z-[60]"
          style={{ [align]: 0 }}
        >
          {(["es", "en"] as const).map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                role="menuitem"
                onClick={() => pick(code)}
                className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-[5px] border-none cursor-pointer text-left font-sans text-sm transition-colors ${
                  active
                    ? "bg-[#1a1a1a] text-white font-semibold"
                    : "bg-transparent text-[#c8c8c8] hover:bg-[#161616] hover:text-white"
                }`}
              >
                <span>{t(code === "es" ? "langEs" : "langEn")}</span>
                {active && <CheckIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#080808]/90 backdrop-blur-[12px] border-b border-[#1a1a1a] px-[clamp(20px,5vw,80px)] flex items-center justify-between h-[60px]">
      <a
        href="#inicio"
        className="flex items-center gap-3 no-underline"
        aria-label="eBecerra"
      >
        {/* width+height intrínsecos (viewBox 1024x1024, ratio 1:1) reservan
            espacio y evitan CLS. CSS sobreescribe el tamaño visible. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-bracket-b-neon.svg"
          alt="eBecerra"
          width={32}
          height={32}
          style={{ height: 32, width: "auto", display: "block" }}
        />
        <span className="flex items-baseline gap-0.5 font-sans">
          <span className="text-white font-semibold text-[18px] tracking-tight">
            eBecerra
          </span>
          <span className="text-[#00ff88] font-mono text-[14px]">.tech</span>
        </span>
      </a>

      <div className="hidden lg:flex items-center gap-1">
        {NAV_IDS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="text-white text-[13px] font-mono tracking-[0.05em] px-3 py-1.5 rounded hover:text-[#00ff88] hover:bg-[#00ff88]/[0.06] transition-all duration-200 cursor-pointer"
          >
            {t(item.key)}
          </button>
        ))}
        <div className="ml-2">
          <LangSwitch align="right" />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <LangSwitch align="right" />
        <button
          className="flex flex-col gap-1 p-2 bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label={t("menu")}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <span className="block w-5 h-[2px] bg-white transition-all" />
          <span className="block w-5 h-[2px] bg-white transition-all" />
          <span className="block w-5 h-[2px] bg-white transition-all" />
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed top-[60px] left-0 right-0 bg-[#080808]/95 backdrop-blur-[12px] flex flex-col items-center py-5 gap-1 lg:hidden z-[99]"
        >
          {NAV_IDS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollTo(item.id);
                setOpen(false);
              }}
              className="text-white text-[13px] font-mono tracking-[0.05em] px-3 py-2 rounded hover:text-[#00ff88] transition-all duration-200 w-full text-center cursor-pointer"
            >
              {t(item.key)}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
