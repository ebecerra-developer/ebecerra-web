import type { PostFull } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";

type Props = {
  post: PostFull;
  url: string;
};

/**
 * JSON-LD schema.org Article + Person para AEO/SEO.
 * Lo emite el server, sin script JS — solo JSON inline en el head.
 */
export default function PostJsonLd({ post, url }: Props) {
  const author = post.authorFull;

  const ogImage =
    post.ogImage?.asset
      ? urlFor(post.ogImage).width(1200).height(630).fit("crop").auto("format").url()
      : post.coverImage?.asset
        ? urlFor(post.coverImage).width(1200).height(630).fit("crop").auto("format").url()
        : null;

  const personLd = author
    ? {
        "@type": "Person",
        name: author.name,
        url: author.social?.websiteUrl ?? undefined,
        sameAs: [
          author.social?.linkedinUrl,
          author.social?.githubUrl,
          author.social?.twitterUrl,
          author.social?.instagramUrl,
        ].filter(Boolean),
        jobTitle: author.jobTitle ?? undefined,
        email: author.email ?? undefined,
      }
    : undefined;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: post.title ? undefined : undefined,
    image: ogImage ? [ogImage] : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    author: personLd,
    publisher: {
      "@type": "Organization",
      name: "ebecerra.es",
      url: "https://ebecerra.es",
    },
    keywords: post.tags.map((t) => t.title).join(", ") || undefined,
    articleSection: post.category?.title ?? undefined,
  };

  // Limpia undefined antes de serializar — schema.org no quiere claves null/undefined.
  const clean = JSON.parse(JSON.stringify(articleLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}
