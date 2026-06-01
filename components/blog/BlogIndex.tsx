"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

type Props = {
  posts: PostMeta[];
  locale: string;
};

function PostCard({ post, locale, featured = false }: { post: PostMeta; locale: string; featured?: boolean }) {
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className={`group block rounded-2xl border border-slate-800 hover:border-brand-lime transition-all duration-200 overflow-hidden ${
        featured ? "p-8 md:p-10" : "p-6"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <time className="text-xs text-slate-500">{post.date}</time>
        {post.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
      <h2
        className={`font-extrabold text-foreground group-hover:text-brand-lime transition-colors leading-tight mb-3 ${
          featured ? "text-2xl md:text-3xl" : "text-xl"
        }`}
      >
        {post.title}
      </h2>
      <p className={`text-slate-400 leading-relaxed ${featured ? "text-base" : "text-sm"}`}>
        {post.excerpt}
      </p>
      <span className="inline-block mt-5 text-brand-lime text-sm font-semibold group-hover:underline">
        {locale === "es" ? "Leer más →" : "Read more →"}
      </span>
    </Link>
  );
}

export function BlogIndex({ posts, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") ?? "";
  const [activeTag, setActiveTag] = useState(initialTag);

  // Collect all unique tags across posts
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

  // Keep state in sync if browser navigates back/forward
  useEffect(() => {
    setActiveTag(searchParams.get("tag") ?? "");
  }, [searchParams]);

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => handleTag("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
              !activeTag
                ? "bg-brand-lime text-black border-brand-lime"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
            }`}
          >
            {locale === "es" ? "Todos" : "All"}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium capitalize ${
                activeTag === tag
                  ? "bg-brand-lime text-black border-brand-lime"
                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <p className="text-5xl mb-4">🏃</p>
          <p className="text-lg">
            {locale === "es"
              ? "No hay posts con ese tag aún."
              : "No posts with that tag yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {featured && (
            <PostCard post={featured} locale={locale} featured={filtered.length === 1 || rest.length === 0} />
          )}
          {rest.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
