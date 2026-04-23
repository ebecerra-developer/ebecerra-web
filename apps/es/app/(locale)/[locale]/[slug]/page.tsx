import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import { getLegalPage, getLegalPageSlugs } from "@ebecerra/sanity-client";

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getLegalPageSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getLegalPage(slug, locale);
  if (!page) return {};
  const canonical = locale === "es" ? `/${slug}` : `/en/${slug}`;
  return {
    title: page.title,
    description: page.metaDescription ?? undefined,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === "es" ? `/${slug}` : `/en/${slug}`])
      ),
    },
  };
}

const legalComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a href={value?.href} target={value?.href?.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage(slug, locale);
  if (!page) notFound();

  return (
    <>
      <Nav />
      <main id="main" className="px-[clamp(20px,5vw,80px)] py-[64px]">
        <article className="max-w-[760px] mx-auto prose-legal">
          <h1>{page.title}</h1>
          {page.updatedAt && (
            <span className="updated">
              {locale === "es"
                ? `Última actualización: ${formatDate(page.updatedAt, "es")}`
                : `Last updated: ${formatDate(page.updatedAt, "en")}`}
            </span>
          )}
          <PortableText value={page.content} components={legalComponents} />
        </article>
      </main>
      <Footer />

      <style>{`
        .prose-legal h1 {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .prose-legal .updated {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-bottom: 32px;
          display: block;
        }
        .prose-legal h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text);
          margin-top: 40px;
          margin-bottom: 12px;
        }
        .prose-legal p,
        .prose-legal li {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }
        .prose-legal p {
          margin-bottom: 14px;
        }
        .prose-legal ul {
          padding-left: 20px;
          margin-bottom: 14px;
        }
        .prose-legal li {
          margin-bottom: 6px;
        }
        .prose-legal a {
          color: var(--cta);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-legal strong { color: var(--text); }
      `}</style>
    </>
  );
}

function formatDate(isoDate: string, locale: "es" | "en"): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
