import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

// Placeholder blog index — will be powered by MDX + Contentlayer
const posts: { slug: string; title: string; date: string; excerpt: string }[] =
  [];

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "/blog");
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Blog
          </h1>
          <p className="text-slate-400 text-lg mb-12">
            Stories from the running world. Club spotlights, race recaps &
            culture.
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <p className="text-6xl mb-4">🏃</p>
              <p className="text-xl">Stories coming soon. Keep running.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block p-6 rounded-2xl border border-slate-800 hover:border-brand-lime transition-colors"
                >
                  <time className="text-sm text-slate-500">{post.date}</time>
                  <h2 className="text-xl font-bold text-foreground mt-2 mb-3 group-hover:text-brand-lime transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-400">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
