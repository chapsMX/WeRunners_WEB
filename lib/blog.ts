import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PostFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  author?: string;
  tags?: string[];
  coverImage?: string;
  alternates?: Record<string, string>;
  draft?: boolean;
};

export type PostMeta = PostFrontmatter & {
  slug: string;
};

export type Post = PostMeta & {
  content: string;
};

const contentDir = path.join(process.cwd(), "content/blog");

function getLocaleDir(locale: string) {
  return path.join(contentDir, locale);
}

export function getPostSlugs(locale: string): string[] {
  const dir = getLocaleDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx|md)$/, ""));
}

export function getPostBySlug(slug: string, locale: string): Post | null {
  const dir = getLocaleDir(locale);
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const mdPath = path.join(dir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    content,
    title: data.title ?? "Untitled",
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    author: data.author,
    tags: data.tags,
    coverImage: data.coverImage,
    alternates: data.alternates,
    draft: data.draft ?? false,
  };
}

export function getAlternateSlug(slug: string, fromLocale: string, toLocale: string): string | null {
  const post = getPostBySlug(slug, fromLocale);
  return post?.alternates?.[toLocale] ?? null;
}

export function getAllPosts(locale: string): PostMeta[] {
  const slugs = getPostSlugs(locale);
  return slugs
    .map((slug) => {
      const post = getPostBySlug(slug, locale);
      if (!post) return null;
      const { content: _content, ...meta } = post;
      return meta;
    })
    .filter((p): p is PostMeta => p !== null && !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ─── SEO: canonical + hreflang for a post ────────────────────────────────────
// Slugs differ per locale (linked through the `alternates` frontmatter), so the
// generic same-path buildAlternates() helpers don't apply to posts.

export const BLOG_SITE_URL = "https://www.w3runn3rs.com";
const BLOG_LOCALES = ["en", "es"] as const;

export function postUrl(locale: string, slug: string): string {
  return `${BLOG_SITE_URL}/${locale}/blog/${slug}`;
}

/**
 * canonical: always the post itself.
 * languages: itself + each translation that exists and isn't a draft;
 * x-default → the English version when there is one.
 */
export function getPostAlternates(
  slug: string,
  locale: string
): { canonical: string; languages: Record<string, string> } | null {
  const post = getPostBySlug(slug, locale);
  if (!post) return null;

  const canonical = postUrl(locale, slug);
  const languages: Record<string, string> = { [locale]: canonical };

  for (const other of BLOG_LOCALES) {
    if (other === locale) continue;
    const altSlug = post.alternates?.[other];
    const altPost = altSlug ? getPostBySlug(altSlug, other) : null;
    if (altSlug && altPost && !altPost.draft) {
      languages[other] = postUrl(other, altSlug);
    }
  }
  if (languages.en) languages["x-default"] = languages.en;

  return { canonical, languages };
}
