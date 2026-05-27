import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "/for-clubs");
}

export default function ForClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
