import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
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

      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] flex items-end overflow-hidden">
        <Image
          src="/images/fondoBlog.jpg"
          alt="Blog hero"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-14">
          <h1 className="text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-none mb-4">
            Blog
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-xl">
            {locale === "es"
              ? "Historias del mundo del running. Clubes, carreras y cultura."
              : "Stories from the running world. Club spotlights, race recaps & culture."}
          </p>
        </div>
      </section>

      {/* Posts */}
      <main className="bg-background py-16 px-6 min-h-[40vh]">
        <div className="max-w-6xl mx-auto">
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
