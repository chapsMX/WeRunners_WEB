"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/blog";

type Props = {
  posts: PostMeta[];
  locale: string;
};

function PostCard({
  post,
  locale,
  featured = false,
}: {
  post: PostMeta;
  locale: string;
  featured?: boolean;
}) {
  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === "es" ? "es-MX" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  if (featured) {
    return (
      <Link
        href={`/${locale}/blog/${post.slug}`}
        className="group block rounded-2xl border border-line hover:border-brand-lime bg-surface-alt transition-all duration-300 overflow-hidden mb-8 shadow-sm hover:shadow-md"
      >
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-80">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        <div className="p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <time className="text-xs text-muted">{formattedDate}</time>
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-surface-alt text-foreground border border-line capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-brand-lime transition-colors leading-tight mb-3">
            {post.title}
          </h2>
          <p className="text-muted leading-relaxed text-base line-clamp-3">
            {post.excerpt}
          </p>
          <span className="inline-flex items-center gap-1 mt-6 text-brand-lime text-sm font-semibold group-hover:gap-2 transition-all">
            {locale === "es" ? "Leer más" : "Read more"} →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group block break-inside-avoid mb-6 rounded-2xl border border-line hover:border-brand-lime bg-surface-alt transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
    >
      {post.coverImage && (
        <div className="relative w-full h-48">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <time className="text-xs text-muted">{formattedDate}</time>
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-0.5 rounded-full bg-surface-alt text-foreground border border-line capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-extrabold text-foreground group-hover:text-brand-lime transition-colors leading-tight mb-3">
          {post.title}
        </h2>
        <p className="text-muted text-sm leading-relaxed line-clamp-4">
          {post.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 mt-5 text-brand-lime text-sm font-semibold group-hover:gap-2 transition-all">
          {locale === "es" ? "Leer más" : "Read more"} →
        </span>
      </div>
    </Link>
  );
}

export function BlogIndex({ posts, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") ?? "";
  const [activeTag, setActiveTag] = useState(initialTag);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags ?? []))
  ).sort();

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.includes(activeTag))
    : posts;

  function handleTag(tag: string) {
    const next = activeTag === tag ? "" : tag;
    setActiveTag(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set("tag", next);
    } else {
      params.delete("tag");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    setActiveTag(searchParams.get("tag") ?? "");
  }, [searchParams]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Tag filter bar — sits on bg-foreground, so uses bg-background for buttons */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleTag("")}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all font-medium ${
              !activeTag
                ? "bg-brand-lime text-black border-brand-lime"
                : "bg-surface-alt text-foreground border-line hover:border-brand-lime"
            }`}
          >
            {locale === "es" ? "Todos" : "All"}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-all font-medium capitalize ${
                activeTag === tag
                  ? "bg-brand-lime text-black border-brand-lime"
                  : "bg-surface-alt text-foreground border-line hover:border-brand-lime"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <p className="text-5xl mb-4">🏃</p>
          <p className="text-lg">
            {locale === "es"
              ? "No hay posts con ese tag aún."
              : "No posts with that tag yet."}
          </p>
        </div>
      ) : (
        <>
          {featured && (
            <PostCard post={featured} locale={locale} featured />
          )}
          {rest.length > 0 && (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
