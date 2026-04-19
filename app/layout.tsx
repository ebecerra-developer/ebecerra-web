import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ebecerra.es"),
  title: {
    default: "Enrique Becerra — Desarrollo web para autónomos y PYMEs",
    template: "%s · eBecerra",
  },
  description:
    "Tech Architect Lead especializado en Next.js, Sanity CMS y arquitecturas web modernas. Ayudo a autónomos y pequeñas empresas a tener una presencia digital profesional.",
  authors: [{ name: "Enrique Becerra", url: "https://ebecerra.es" }],
  creator: "Enrique Becerra",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ebecerra.es",
    siteName: "eBecerra",
    title: "Enrique Becerra — Desarrollo web para autónomos y PYMEs",
    description:
      "Tech Architect Lead. Webs construidas con criterio arquitectónico para autónomos y PYMEs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enrique Becerra — Desarrollo web para autónomos y PYMEs",
    description:
      "Tech Architect Lead. Webs construidas con criterio arquitectónico.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
