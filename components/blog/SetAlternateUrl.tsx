"use client";

import { useEffect } from "react";
import { useAlternateUrl } from "@/components/providers/AlternateUrlProvider";

export function SetAlternateUrl({ href }: { href: string | null }) {
  const { setAlternateUrl } = useAlternateUrl();

  useEffect(() => {
    setAlternateUrl(href);
    return () => setAlternateUrl(null);
  }, [href, setAlternateUrl]);

  return null;
}
