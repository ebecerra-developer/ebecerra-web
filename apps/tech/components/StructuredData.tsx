import type { Locale } from "@/i18n/routing";

const SITE_URL = "https://ebecerra.tech";
const ES_URL = "https://ebecerra.es";
const PERSON_URL = `${SITE_URL}/#person`;
const WEBSITE_URL = `${SITE_URL}/#website`;

type Props = { locale: Locale };

export default function StructuredData({ locale }: Props) {
  const inLang = locale === "es" ? "es-ES" : "en-US";

  const person = {
    "@type": "Person",
    "@id": PERSON_URL,
    name: "Enrique Becerra",
    alternateName: "eBecerra",
    url: SITE_URL,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    jobTitle: "Tech Architect Lead",
    worksFor: {
      "@type": "Organization",
      name: "VASS",
      url: "https://vass.com",
    },
    description:
      locale === "es"
        ? "Tech Architect Lead en VASS con más de 8 años de experiencia en Magnolia CMS, Java/Spring y Next.js. Coordinador del gremio VassNolia en VASS University. Arquitecturas web enterprise para administración pública y grandes corporaciones."
        : "Tech Architect Lead at VASS with 8+ years of experience in Magnolia CMS, Java/Spring and Next.js. Coordinator of the VassNolia guild at VASS University. Enterprise web architectures for public administration and large corporations.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    email: "mailto:contacto@ebecerra.es",
    sameAs: [
      "https://www.linkedin.com/in/enrique-becerra-garcia/",
      "https://github.com/Quiquebgit",
      ES_URL,
    ],
    knowsAbout: [
      "Magnolia CMS",
      "Java",
      "Spring",
      "Next.js",
      "React",
      "TypeScript",
      "Software Architecture",
      "Enterprise Web Development",
      "REST APIs",
      "Technical Leadership",
    ],
    knowsLanguage: ["Spanish", "English"],
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_URL,
    url: SITE_URL,
    name: "Enrique Becerra — ebecerra.tech",
    description:
      locale === "es"
        ? "Portfolio técnico de Enrique Becerra, Tech Architect Lead en VASS."
        : "Technical portfolio of Enrique Becerra, Tech Architect Lead at VASS.",
    inLanguage: inLang,
    author: { "@id": PERSON_URL },
    about: { "@id": PERSON_URL },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [person, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
