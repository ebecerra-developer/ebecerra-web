import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import StructuredData from "@/components/StructuredData";
import type { Locale } from "@/i18n/routing";
import "../../globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

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

  const baseUrl = "https://ebecerra.es";
  const canonical = locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`;
  const ogImage = `${baseUrl}/brand/web-app-manifest-512x512.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    applicationName: "eBecerra",
    authors: [{ name: "Enrique Becerra", url: baseUrl }],
    creator: "Enrique Becerra",
    publisher: "Enrique Becerra",
    keywords:
      locale === "es"
        ? [
            "desarrollo web",
            "freelance",
            "Next.js",
            "Sanity CMS",
            "autónomos",
            "PYMEs",
            "Madrid",
            "tech architect",
            "web profesional",
            "Enrique Becerra",
          ]
        : [
            "web development",
            "freelance",
            "Next.js",
            "Sanity CMS",
            "freelancers",
            "SMBs",
            "Madrid",
            "tech architect",
            "professional website",
            "Enrique Becerra",
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
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_ES"],
      url: canonical,
      siteName: "eBecerra",
      title: t("title"),
      description: t("ogDescription"),
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: "Enrique Becerra — eBecerra",
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
  const t = await getTranslations({ locale, namespace: "a11y" });

  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999] focus:rounded-md focus:bg-[var(--cta)] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none"
        >
          {t("skipToContent")}
        </a>
        <StructuredData locale={locale as Locale} />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
