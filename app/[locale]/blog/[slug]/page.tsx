import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPostSlugs, getAlternateSlug, getAllPosts } from "@/lib/blog";
import { SetAlternateUrl } from "@/components/blog/SetAlternateUrl";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { YouTubeEmbed } from "@/components/blog/YouTubeEmbed";

const SITE_URL = "https://www.w3runn3rs.com";

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

  const ogImage = post.coverImage
    ? `${SITE_URL}${post.coverImage}`
    : `${SITE_URL}/images/share.png`;

  return {
    title: `${post.title} — W3Runn3rs Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
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

  const allPosts = getAllPosts(locale);
  const related = allPosts
    .filter(
      (p) =>
        p.slug !== slug &&
        p.tags?.some((t) => post.tags?.includes(t))
    )
    .slice(0, 2);

  const formattedDate = new Date(post.date).toLocaleDateString(
    locale === "es" ? "es-MX" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const ogImage = post.coverImage
    ? `${SITE_URL}${post.coverImage}`
    : `${SITE_URL}/images/share.png`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author ?? "W3Runn3rs Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "W3Runn3rs",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/w3_logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${locale}/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SetAlternateUrl href={alternateHref} />
      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-lime mb-10 transition-colors"
          >
            ← {locale === "es" ? "Volver al blog" : "Back to blog"}
          </Link>

          {/* Post header */}
          <header className="mb-8">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                    className="text-xs px-2.5 py-1 rounded-full border border-line text-muted hover:border-brand-lime hover:text-brand-lime transition-colors capitalize"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-5">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {post.author && (
                <>
                  <span>{locale === "es" ? "Por" : "By"} {post.author}</span>
                  <span>·</span>
                </>
              )}
              <time>{formattedDate}</time>
              <span>·</span>
              <span>{readingTime(post.content, locale)}</span>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          <hr className="border-line mb-10" />

          {/* Article */}
          <article className="prose dark:prose-invert prose-lime max-w-none
            prose-headings:font-extrabold prose-headings:text-foreground
            prose-p:text-foreground prose-p:opacity-80
            prose-li:text-foreground prose-li:opacity-80
            prose-a:text-brand-lime prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-hr:border-line
            prose-blockquote:border-brand-lime prose-blockquote:text-muted">
            <MDXRemote source={post.content} components={{ YouTubeEmbed }} />
          </article>

          {/* Share buttons */}
          <ShareButtons slug={slug} locale={locale} title={post.title} />

          <hr className="border-line mt-10 mb-10" />

          {/* Big CTA */}
          <div className="rounded-2xl bg-surface-alt border border-line p-8 md:p-10 text-center mb-10">
            <p className="text-muted text-sm uppercase tracking-widest font-semibold mb-3">
              {locale === "es" ? "¿Listo para correr?" : "Ready to run?"}
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-6">
              {locale === "es"
                ? "Encuentra tu club en w3runn3rs."
                : "Find your running club on w3runn3rs."}
            </h2>
            <Link
              href={`/${locale}/waitlist`}
              className="inline-flex items-center justify-center gap-2 bg-brand-green text-black font-semibold text-base px-8 py-3.5 rounded-lg hover:bg-brand-green/80 transition-all"
            >
              {locale === "es" ? "Únete a la lista de espera →" : "Join the Waitlist →"}
            </Link>
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/blog`}
              className="text-sm text-muted hover:text-brand-lime transition-colors"
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
