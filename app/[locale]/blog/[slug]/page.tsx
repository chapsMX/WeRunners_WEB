import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // TODO: Load MDX content via Contentlayer when blog posts exist
  // For now, show a placeholder
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lime">
          <p className="text-slate-500 text-sm mb-4">
            Blog post: <code>{slug}</code>
          </p>
          <h1 className="text-4xl font-extrabold text-foreground">
            Coming Soon
          </h1>
          <p className="text-slate-400">
            This post is being written. Check back soon.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
