import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/metadata";
import { shareMetadata } from "@/lib/app-share-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ambassadors" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return buildPageMetadata(locale, "/ambassadors", {
    title,
    description,
    // Static share card per language (same for everyone: no need to generate it).
    ...shareMetadata({
      title,
      description,
      image: `/images/share-ambassadors-${locale === "es" ? "es" : "en"}.jpg`,
      width: 1000,
      height: 522,
    }),
  });
}

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
