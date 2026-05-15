import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import StructuredData from "@/components/StructuredData";
import type { Locale } from "@/i18n/routing";
import { ChatbotWidget } from "@ebecerra/chatbot/client";
import { getProfileChatbot } from "@ebecerra/sanity-client";
import "../../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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

  const baseUrl = "https://ebecerra.tech";
  const canonical = locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`;
  const ogImage = `${baseUrl}/brand/web-app-manifest-512x512.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    applicationName: "eBecerra.tech",
    authors: [{ name: "Enrique Becerra", url: baseUrl }],
    creator: "Enrique Becerra",
    publisher: "Enrique Becerra",
    keywords:
      locale === "es"
        ? [
            "Enrique Becerra",
            "tech architect",
            "Magnolia CMS",
            "Java",
            "Spring",
            "Next.js",
            "arquitectura software",
            "VASS",
            "VassNolia",
            "portfolio técnico",
          ]
        : [
            "Enrique Becerra",
            "tech architect",
            "Magnolia CMS",
            "Java",
            "Spring",
            "Next.js",
            "software architecture",
            "VASS",
            "VassNolia",
            "tech portfolio",
          ],
    alternates: {
      canonical,
      languages: {
        es: baseUrl,
        en: `${baseUrl}/en`,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      type: "profile",
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
      url: canonical,
      siteName: "ebecerra.tech",
      title: t("title"),
      description: t("ogDescription"),
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: "Enrique Becerra — ebecerra.tech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("twitterDescription"),
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "technology",
    formatDetection: { telephone: false, address: false, email: false },
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
  const [t, chatbot] = await Promise.all([
    getTranslations({ locale, namespace: "a11y" }),
    getProfileChatbot(locale, "chatbotTech").catch(() => null),
  ]);

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:rounded-md focus:bg-[#00ff88] focus:px-4 focus:py-2 focus:font-mono focus:text-[#080808] focus:shadow-lg focus:outline-none"
        >
          {t("skipToContent")}
        </a>
        <StructuredData locale={locale as Locale} />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        {chatbot?.enabled && (
          <ChatbotWidget
            launcherLabel={chatbot.label ?? (locale === "es" ? "Consola" : "Console")}
            drawerTitle={chatbot.title ?? "ebecerra.tech"}
            greeting={
              chatbot.greeting ??
              (locale === "es"
                ? "Hola. Pregúntame sobre el stack, los proyectos o cualquier cosa técnica."
                : "Hi. Ask me about the stack, projects, or anything technical.")
            }
            placeholder={
              chatbot.placeholder ??
              (locale === "es" ? "Pregunta técnica…" : "Technical question…")
            }
            locale={locale}
            disclaimers={[
              ...(chatbot.disclaimers ?? []),
              ...(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
                ? [
                    locale === "es"
                      ? "Esta conversación se guarda para mejorar el servicio. Más info en ebecerra.es/privacidad."
                      : "This conversation is stored to improve the service. More info at ebecerra.es/en/privacidad.",
                  ]
                : []),
            ]}
          />
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
