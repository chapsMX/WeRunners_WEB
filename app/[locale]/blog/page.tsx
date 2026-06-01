import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/metadata";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getAllPosts } from "@/lib/blog";
import { BlogIndex } from "@/components/blog/BlogIndex";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "/blog");
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllPosts(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3">
              Blog
            </h1>
            <p className="text-slate-400 text-lg">
              {locale === "es"
                ? "Historias del mundo del running. Clubes, carreras y cultura."
                : "Stories from the running world. Club spotlights, race recaps & culture."}
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <p className="text-5xl mb-4">🏃</p>
              <p className="text-xl">
                {locale === "es"
                  ? "Historias pronto. Sigue corriendo."
                  : "Stories coming soon. Keep running."}
              </p>
            </div>
          ) : (
            <Suspense>
              <BlogIndex posts={posts} locale={locale} />
            </Suspense>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
