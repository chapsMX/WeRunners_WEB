"use client";

import { useEffect } from "react";

/**
 * Aplica el atributo lang al elemento <html> en el cliente.
 * Necesario porque el <html> vive en el root layout (app/layout.tsx)
 * mientras que el locale solo se conoce dentro de app/[locale]/layout.tsx.
 */
export function LangSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
