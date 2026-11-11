import type { Metadata } from "next"

// Link-preview metadata shared by every app page. Pages that set their own
// openGraph/twitter must spread these: Next replaces those objects wholesale,
// so leaving them out would drop the share image.

const SHARE_IMAGE = "/images/share.png" // 1200×630, same as the landing

export const appOpenGraph = {
  siteName: "W3Runn3rs",
  type: "website",
  images: [
    {
      url: SHARE_IMAGE,
      width: 1200,
      height: 630,
      alt: "W3Runn3rs - The global hub for running clubs.",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>

export const appTwitter = {
  card: "summary_large_image",
  site: "@w3runn3rs",
  creator: "@w3runn3rs",
  images: [SHARE_IMAGE],
} satisfies NonNullable<Metadata["twitter"]>
