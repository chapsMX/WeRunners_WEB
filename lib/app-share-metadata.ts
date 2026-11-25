import type { Metadata } from "next"

// Link-preview metadata shared by every app page. Pages that set their own
// openGraph/twitter must spread these: Next replaces those objects wholesale,
// so leaving them out would drop the share image.

const SHARE_IMAGE = "/images/share.png" // 1200×630, same as the landing

export const appOpenGraph = {
  siteName: "We Runners",
  type: "website",
  images: [
    {
      url: SHARE_IMAGE,
      width: 1200,
      height: 630,
      alt: "We Runners - The global hub for running clubs.",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>

export const appTwitter = {
  card: "summary_large_image",
  site: "@w3runn3rs",
  creator: "@w3runn3rs",
  images: [SHARE_IMAGE],
} satisfies NonNullable<Metadata["twitter"]>

/**
 * Link preview with its own share card (an /api/og/* image, 1200×630).
 * Relative image URLs resolve against the layout's metadataBase (www or app).
 */
export function shareMetadata({
  title,
  description,
  image,
  alt,
}: {
  title: string
  description: string
  image: string
  alt?: string
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [{ url: image, width: 1200, height: 630, alt: alt ?? title }]
  return {
    openGraph: { ...appOpenGraph, title, description, images },
    twitter: { ...appTwitter, title, description, images: [image] },
  }
}
