"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AlternateUrlContextType = {
  alternateUrl: string | null;
  setAlternateUrl: (url: string | null) => void;
};

const AlternateUrlContext = createContext<AlternateUrlContextType>({
  alternateUrl: null,
  setAlternateUrl: () => {},
});

export function AlternateUrlProvider({ children }: { children: ReactNode }) {
  const [alternateUrl, setAlternateUrl] = useState<string | null>(null);
  return (
    <AlternateUrlContext.Provider value={{ alternateUrl, setAlternateUrl }}>
      {children}
    </AlternateUrlContext.Provider>
  );
}

export function useAlternateUrl() {
  return useContext(AlternateUrlContext);
}
