import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import StructuredData from "@/components/StructuredData";
import { getSiteSettingsFull, getProfile, getServices } from "@ebecerra/sanity-client";
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
  const [t, sanitySettings] = await Promise.all([
    getTranslations({ locale, namespace: "metadata" }),
    getSiteSettingsFull(locale),
  ]);
  const sanityMeta = sanitySettings.metadata;

  const baseUrl = "https://ebecerra.es";
  const canonical = locale === routing.defaultLocale ? baseUrl : `${baseUrl}/${locale}`;
  const ogImage = `${baseUrl}/brand/web-app-manifest-512x512.png`;

  const title = sanityMeta?.title ?? t("title");
  const titleTemplate = sanityMeta?.titleTemplate ?? t("titleTemplate");
  const description = sanityMeta?.description ?? t("description");
  const ogDescription = sanityMeta?.ogDescription ?? t("ogDescription");
  const twitterDescription = sanityMeta?.twitterDescription ?? t("twitterDescription");
  const keywords =
    sanityMeta?.keywords?.length
      ? sanityMeta.keywords
      : locale === "es"
        ? [
            "desarrollo web a medida",
            "autónomos",
            "PYMEs",
            "Madrid",
            "web para clínica",
            "web para despacho",
            "Enrique Becerra",
          ]
        : [
            "custom web development",
            "freelancers",
            "SMBs",
            "Madrid",
            "website for clinics",
            "website for law firms",
            "Enrique Becerra",
          ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description,
    applicationName: "eBecerra",
    authors: [{ name: "Enrique Becerra", url: baseUrl }],
    creator: "Enrique Becerra",
    publisher: "Enrique Becerra",
    keywords,
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
      title,
      description: ogDescription,
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
      title,
      description: twitterDescription,
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
  const [t, settings, profile, services] = await Promise.all([
    getTranslations({ locale, namespace: "a11y" }),
    getSiteSettingsFull(locale),
    getProfile(locale),
    getServices(locale).catch(() => []),
  ]);

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
        <StructuredData
          settings={settings}
          profile={profile}
          services={services}
          locale={locale as Locale}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
