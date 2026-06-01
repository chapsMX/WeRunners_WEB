import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

type Props = {
  posts: PostMeta[];
  locale: string;
};

export function RelatedPosts({ posts, locale }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-extrabold text-foreground mb-6">
        {locale === "es" ? "Posts relacionados" : "Related posts"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="group block p-5 rounded-xl border border-line bg-surface-alt hover:border-brand-lime transition-colors"
          >
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-background text-muted capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-base font-bold text-foreground group-hover:text-brand-lime transition-colors leading-snug mb-1">
              {post.title}
            </h3>
            <time className="text-xs text-muted">{post.date}</time>
          </Link>
        ))}
      </div>
    </section>
  );
}
