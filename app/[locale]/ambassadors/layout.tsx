import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ambassadors" });
  return buildPageMetadata(locale, "/ambassadors", {
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default function AmbassadorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
