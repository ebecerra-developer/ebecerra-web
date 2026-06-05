import type { Metadata, Viewport } from "next";
import {
  DM_Sans,
  Fraunces,
  Cormorant_Garamond,
  Inter,
  Space_Grotesk,
  Manrope,
  Bricolage_Grotesque,
  Instrument_Serif,
  Oswald,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { routing } from "@/i18n/routing";
import { SanityLive } from "@ebecerra/sanity-client";
import { DisableDraftMode } from "@/components/DisableDraftMode";
import "../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

// Coach A — autoridad cálida (perfil mujer madura, salud hormonal)
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Coach B — marca personal moderna (perfil generalista con redes)
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Tándem — agencia de marketing (Bricolage chunky + Instrument Serif italic)
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Expedición — turismo activo / aventura (señalética condensada de sendero)
const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

// interactiveWidget: "resizes-content" → cuando el teclado virtual se abre, la
// layout viewport se reduce (no solo la visual). Necesario para que el
// drawer del chatbot se adapte en in-app browsers (IG, FB) que no respetan
// window.visualViewport.height al abrir el teclado.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${fraunces.variable} ${cormorant.variable} ${inter.variable} ${spaceGrotesk.variable} ${manrope.variable} ${bricolage.variable} ${instrumentSerif.variable} ${oswald.variable}`}
    >
      <body>
        {/* style inline: la regla base `a{color:var(--cta)}` gana a las
            utilidades de Tailwind; inline garantiza texto visible en el skip-link */}
        <a
          href="#main"
          style={{ color: "#fff" }}
          className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:left-3 focus:z-[999] focus:rounded-md focus:bg-[var(--cta)] focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <SanityLive />
        {(await draftMode()).isEnabled && (
          <>
            <VisualEditing />
            <DisableDraftMode />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
