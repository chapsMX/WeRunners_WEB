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
    // Share card in the page's language (hero photo + headline).
    ...shareMetadata({ title, description, image: `/api/og/ambassadors?lang=${locale === "es" ? "es" : "en"}` }),
  });
}

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
