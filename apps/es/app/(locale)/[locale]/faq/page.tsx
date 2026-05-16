import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import FaqList from "@/components/faq/FaqList";
import FaqContactBlock from "@/components/faq/FaqContactBlock";
import { getFaq } from "@/lib/faq";
import { getFaqPage, getFaqItems } from "@ebecerra/sanity-client";
import styles from "./Faq.module.css";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  const faqPage = await getFaqPage(locale);
  const canonical = locale === "es" ? "/faq/" : "/en/faq/";

  const title = faqPage?.metaTitle || t("metaTitle");
  const description = faqPage?.metaDescription || t("metaDescription");

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: "/faq/",
        en: "/en/faq/",
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
      <main id="main" className={styles.main}>
        <div className={styles.container}>
          <PageHero
            kicker={faqPage?.kicker || t("kicker")}
            title={faqPage?.title || t("title")}
            lead={faqPage?.lead || t("lead")}
          />
          <FaqList items={items} />
          <FaqContactBlock
            title={faqPage?.contactSectionTitle || t("contactTitle")}
            lead={faqPage?.contactSectionLead || t("contactLead")}
            cta={faqPage?.contactCta || t("contactCta")}
            href={locale === "es" ? "/#contacto" : "/en#contacto"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
