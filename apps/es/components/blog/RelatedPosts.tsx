import type { PostListItem } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import PostCard from "./PostCard";
import styles from "./RelatedPosts.module.css";

type Props = {
  posts: PostListItem[];
  locale: Locale;
  label: string;
};

export default function RelatedPosts({ posts, locale, label }: Props) {
  if (posts.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="related-heading">
      <h2 id="related-heading" className={styles.heading}>
        {label}
      </h2>
      <div className={styles.grid}>
        {posts.map((post) => (
          <PostCard key={post._id} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
