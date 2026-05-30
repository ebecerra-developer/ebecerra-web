import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  const faqPage = await getFaqPage(locale);
  const canonical = locale === "es" ? "/faq/" : "/en/faq/";

  return {
    title: faqPage.metaTitle,
    description: faqPage.metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: "/faq/",
        en: "/en/faq/",
      },
    },
    openGraph: {
      title: faqPage.metaTitle,
      description: faqPage.metaDescription,
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
        <PageHero
          breadcrumbs={[
            { label: locale === "es" ? "Inicio" : "Home", href: locale === "es" ? "/" : `/${locale}/` },
            { label: faqPage.title ?? "FAQ" },
          ]}
          kicker={faqPage.kicker ?? ""}
          title={faqPage.title ?? ""}
          lead={faqPage.lead ?? ""}
        />
        <FaqList items={items} />
        <FaqContactBlock
          title={faqPage.contactSectionTitle ?? ""}
          lead={faqPage.contactSectionLead ?? ""}
          cta={faqPage.contactCta ?? ""}
          href={locale === "es" ? "/#contacto" : "/en#contacto"}
        />
      </main>
      <Footer />
    </>
  );
}
