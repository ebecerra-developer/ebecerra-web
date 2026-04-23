import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getFaq } from "@/lib/faq";
import { getFaqPage, getFaqItems } from "@ebecerra/sanity-client";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const faqPage = await getFaqPage(locale);
  const canonical = locale === "es" ? "/faq" : "/en/faq";

  const title = faqPage?.metaTitle || t("metaTitle");
  const description = faqPage?.metaDescription || t("metaDescription");

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: "/faq",
        en: "/en/faq",
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: canonical,
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "faq" });

  const [faqPage, faqItemsRaw] = await Promise.all([
    getFaqPage(locale),
    getFaqItems(locale),
  ]);

  const localItems = getFaq(locale);
  const items =
    faqItemsRaw.length > 0
      ? faqItemsRaw.map((i) => ({ q: i.question, a: i.answer }))
      : localItems;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <main id="main" style={{ padding: "clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px)" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            {(faqPage?.kicker || t("kicker")).replace(/^\/\/\s*/, "// ")}
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 4.2vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              margin: "0 0 16px",
            }}
          >
            {faqPage?.title || t("title")}
          </h1>
          <p
            className="lead"
            style={{
              margin: "0 0 40px",
              color: "var(--text-secondary)",
              maxWidth: 640,
            }}
          >
            {faqPage?.lead || t("lead")}
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {items.map((item, idx) => (
              <li
                key={idx}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
              >
                <details className="faq-item">
                  <summary
                    style={{
                      cursor: "pointer",
                      padding: "18px 22px",
                      fontSize: 17,
                      fontWeight: 600,
                      color: "var(--text)",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 16,
                    }}
                  >
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="faq-icon"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--cta)",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: "0 22px 20px",
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.a}
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <section
            aria-labelledby="faq-contact"
            style={{
              marginTop: 56,
              padding: "32px clamp(22px, 3vw, 36px)",
              background: "var(--surface-subtle)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <h2
              id="faq-contact"
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.015em",
              }}
            >
              {faqPage?.contactSectionTitle || t("contactTitle")}
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              {faqPage?.contactSectionLead || t("contactLead")}
            </p>
            <a
              href={locale === "es" ? "/#contacto" : "/en#contacto"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--cta)",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14.5,
              }}
            >
              {faqPage?.contactCta || t("contactCta")} →
            </a>
          </section>
        </div>
      </main>
      <Footer />

      <style>{`
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item[open] .faq-icon { transform: rotate(45deg); }
        .faq-icon { transition: transform 180ms var(--ease); display: inline-block; }
        .faq-item summary:hover { background: var(--surface-subtle); border-radius: 10px; }
      `}</style>
    </>
  );
}
