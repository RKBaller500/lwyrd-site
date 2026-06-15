"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ConsentContextValue {
  grantConsent: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({
  onConsent,
  children,
}: {
  onConsent: () => void;
  children: React.ReactNode;
}) {
  const grantConsent = useCallback(() => {
    onConsent();
  }, [onConsent]);

  return (
    <ConsentContext.Provider value={{ grantConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
