import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPostSlugs, getAlternateSlug, getAllPosts } from "@/lib/blog";
import { SetAlternateUrl } from "@/components/blog/SetAlternateUrl";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

function readingTime(content: string, locale: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return locale === "es" ? `${minutes} min de lectura` : `${minutes} min read`;
}

export async function generateStaticParams() {
  const locales = ["en", "es"];
  return locales.flatMap((locale) =>
    getPostSlugs(locale).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};
  return {
    title: `${post.title} — W3Runn3rs Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) notFound();

  const otherLocale = locale === "en" ? "es" : "en";
  const alternateSlug = getAlternateSlug(slug, locale, otherLocale);
  const alternateHref = alternateSlug
    ? `/${otherLocale}/blog/${alternateSlug}`
    : null;

  // Related posts: same tag(s), exclude current slug, max 2
  const allPosts = getAllPosts(locale);
  const related = allPosts
    .filter(
      (p) =>
        p.slug !== slug &&
        p.tags?.some((t) => post.tags?.includes(t))
    )
    .slice(0, 2);

  return (
    <>
      <SetAlternateUrl href={alternateHref} />
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-brand-lime mb-10 transition-colors"
          >
            ← {locale === "es" ? "Volver al blog" : "Back to blog"}
          </Link>

          {/* Post header */}
          <header className="mb-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full border border-slate-700 text-slate-400 hover:border-brand-lime hover:text-brand-lime transition-colors capitalize"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              {post.author && (
                <>
                  <span>{locale === "es" ? "Por" : "By"} {post.author}</span>
                  <span>·</span>
                </>
              )}
              <time>{post.date}</time>
              <span>·</span>
              <span>{readingTime(post.content, locale)}</span>
            </div>
          </header>

          <hr className="border-slate-800 mb-10" />

          <article className="prose prose-invert prose-lime max-w-none prose-headings:font-extrabold prose-a:text-brand-lime prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-hr:border-slate-800 prose-p:text-slate-300 prose-li:text-slate-300">
            <MDXRemote source={post.content} />
          </article>

          <hr className="border-slate-800 mt-14 mb-8" />

          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/blog`}
              className="text-sm text-slate-400 hover:text-brand-lime transition-colors"
            >
              ← {locale === "es" ? "Volver al blog" : "Back to blog"}
            </Link>
            <Link
              href={`/${locale}/waitlist`}
              className="text-sm font-semibold text-brand-lime hover:underline"
            >
              {locale === "es"
                ? "Únete a la lista de espera →"
                : "Join the Waitlist →"}
            </Link>
          </div>

          <RelatedPosts posts={related} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}
