import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAboutPage, getProfile } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import FaqContactBlock from "@/components/faq/FaqContactBlock";
import TiltCard from "@/components/TiltCard";
import styles from "./page.module.css";

export const revalidate = 1800;

const SITE_URL = "https://ebecerra.es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getAboutPage(locale as Locale);
  const canonical =
    locale === "es" ? `${SITE_URL}/sobre-mi/` : `${SITE_URL}/${locale}/sobre-mi/`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}/sobre-mi/`,
        en: `${SITE_URL}/en/sobre-mi/`,
        "x-default": `${SITE_URL}/sobre-mi/`,
      },
    },
    openGraph: {
      type: "profile",
      url: canonical,
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function SobreMiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, profile] = await Promise.all([
    getAboutPage(locale as Locale),
    getProfile(locale as Locale).catch(() => null),
  ]);

  const photo = profile?.aboutPhoto;
  const photoSrc = photo
    ? {
        src: urlFor(photo).width(720).auto("format").url(),
        srcSet: [360, 540, 720, 960]
          .map((w) => `${urlFor(photo).width(w).auto("format").url()} ${w}w`)
          .join(", "),
        alt: photo.alt ?? profile?.name ?? "Enrique Becerra",
      }
    : null;
  const stats = profile?.stats ?? [];

  const contactHref = locale === "es" ? "/#contacto" : `/${locale}/#contacto`;

  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile?.name ?? "Enrique Becerra",
      jobTitle: locale === "es" ? "Desarrollador web" : "Web developer",
      url: SITE_URL,
      ...(photoSrc ? { image: photoSrc.src } : {}),
      description: page.metaDescription,
    },
  };

  return (
    <>
      <Nav />
      <main id="main" className={styles.main}>
        <div className={styles.inner}>
          <PageHero
            breadcrumbs={[
              {
                label: locale === "es" ? "Inicio" : "Home",
                href: locale === "es" ? "/" : `/${locale}/`,
              },
              { label: locale === "es" ? "Sobre mí" : "About me" },
            ]}
            kicker={page.kicker}
            title={page.title}
            lead={page.lead}
          />

          <div className={styles.body}>
            <div className={styles.story}>
              {page.intro.map((p, i) => (
                <p key={i} className={styles.para}>
                  {p.text}
                </p>
              ))}
            </div>

            {(photoSrc || stats.length > 0) && (
              <aside className={styles.aside}>
                {photoSrc && (
                  <div className={styles.photoWrap}>
                    <span aria-hidden="true" className={styles.photoStar}>
                      ✦
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoSrc.src}
                      srcSet={photoSrc.srcSet}
                      sizes="(min-width: 900px) 320px, 80vw"
                      alt={photoSrc.alt}
                      loading="lazy"
                      decoding="async"
                      width={720}
                      height={900}
                      className={styles.photo}
                    />
                  </div>
                )}
                {stats.length > 0 && (
                  <ul className={styles.stats}>
                    {stats.map((s, i) => (
                      <li key={`${s.label}-${i}`} className={styles.stat}>
                        <span className={styles.statValue}>{s.value}</span>
                        <span className={styles.statLabel}>{s.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
            )}
          </div>

          {page.pillars.length > 0 && (
            <section
              className={styles.pillars}
              aria-label={page.pillarsTitle || undefined}
            >
              {page.pillarsTitle && (
                <h2 className={styles.pillarsTitle}>{page.pillarsTitle}</h2>
              )}
              <div className={styles.pillarGrid}>
                {page.pillars.map((pl, i) => (
                  <TiltCard key={i} className={styles.pillarCard}>
                    <span className={styles.pillarStar} aria-hidden="true">
                      ✦
                    </span>
                    <h3 className={styles.pillarCardTitle}>{pl.title}</h3>
                    <p className={styles.pillarCardBody}>{pl.body}</p>
                  </TiltCard>
                ))}
              </div>
            </section>
          )}

          <FaqContactBlock
            title={page.closingTitle}
            lead={page.closingBody}
            cta={page.closingCtaLabel}
            href={contactHref}
          />
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }}
      />
      <Footer />
    </>
  );
}
