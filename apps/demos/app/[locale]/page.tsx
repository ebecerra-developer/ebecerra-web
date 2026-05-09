import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  getDemoSiteBySlug,
  getPublishedDemoSites,
} from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FisioTemplate from "@/components/templates/fisio/FisioTemplate";
import DemoBanner from "./[slug]/DemoBanner";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Demos",
  robots: { index: false, follow: false },
};

export default async function DemosRootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const summaries = await getPublishedDemoSites(locale as Locale);
  const first = summaries[0];

  if (!first) {
    return (
      <main
        id="main"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "3rem 1.5rem",
          background: "var(--bg, #f7f0e3)",
          color: "var(--text, #2a1f12)",
          textAlign: "center",
          fontFamily:
            '"DM Sans", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        }}
      >
        <div>
          <p style={{ fontSize: "1.25rem" }}>
            Aún no hay demos publicadas. Vuelve pronto.
          </p>
        </div>
      </main>
    );
  }

  const demo = await getDemoSiteBySlug(first.slug, locale as Locale);
  if (!demo) return null;

  return (
    <>
      <DemoBanner />
      {demo.template === "fisio" ? (
        <FisioTemplate demo={demo} locale={locale as Locale} />
      ) : (
        <main id="main" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          <p>
            Plantilla <code>{demo.template}</code> aún no implementada.
          </p>
        </main>
      )}
    </>
  );
}
