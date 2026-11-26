import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable streaming metadata: title/canonical/hreflang must be in <head> for
  // every user agent. Since Next 15.2, dynamic pages stream metadata into
  // <body> for non-"limited" bots (Googlebot included), and Google ignores
  // rel=canonical inside <body>.
  htmlLimitedBots: /.*/,
  // The sitemap is dynamic (it reads the host: www vs app), so it runs as a
  // function and only sees files that are traced into it. lib/blog reads the
  // MDX files with fs at runtime; without this the blog posts silently vanish.
  outputFileTracingIncludes: {
    "/sitemap.xml": ["./content/blog/**/*"],
  },
  images: {
    remotePatterns: [
      // Fotos de perfil de Google OAuth
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Avatares subidos a Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
