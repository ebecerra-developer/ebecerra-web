import Image from "next/image";
import type { BlogAuthor } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import styles from "./AuthorBio.module.css";

type Props = {
  author: BlogAuthor;
  byLabel: string;
};

export default function AuthorBio({ author, byLabel }: Props) {
  const photo =
    author.photo && author.photo.asset
      ? urlFor(author.photo).width(160).height(160).fit("crop").auto("format").url()
      : null;

  const social = author.social;
  const socialLinks = [
    { url: social?.linkedinUrl, label: "LinkedIn" },
    { url: social?.githubUrl, label: "GitHub" },
    { url: social?.twitterUrl, label: "Twitter / X" },
    { url: social?.instagramUrl, label: "Instagram" },
    { url: social?.websiteUrl, label: "Web" },
  ].filter((s): s is { url: string; label: string } => Boolean(s.url));

  return (
    <aside className={styles.bio} aria-label={`${byLabel} ${author.name}`}>
      {photo && (
        <Image
          src={photo}
          alt={author.name}
          width={80}
          height={80}
          className={styles.photo}
        />
      )}
      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.label}>{byLabel}</div>
          <div className={styles.name}>{author.name}</div>
          {author.jobTitle && <div className={styles.role}>{author.jobTitle}</div>}
        </div>
        <p className={styles.text}>{author.bioShort}</p>
        {socialLinks.length > 0 && (
          <ul className={styles.social}>
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
