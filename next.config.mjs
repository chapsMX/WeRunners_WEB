import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable streaming metadata: title/canonical/hreflang must be in <head> for
  // every user agent. Since Next 15.2, dynamic pages stream metadata into
  // <body> for non-"limited" bots (Googlebot included), and Google ignores
  // rel=canonical inside <body>.
  htmlLimitedBots: /.*/,
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
