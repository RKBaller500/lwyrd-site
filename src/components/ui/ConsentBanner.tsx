"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/context/ConsentContext";

const CONSENT_KEY = "lwyrd_analytics_consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const { grantConsent } = useConsent();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (localStorage.getItem(CONSENT_KEY) === null) {
        setVisible(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const accept = () => {
    // grantConsent() writes "true" to localStorage and inits PostHog via React context  
    // no forgeable global window event is involved.
    grantConsent();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "false");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col gap-2 border-t border-[#ddd7cc] bg-[#fbfaf6] px-3 py-3 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 sm:py-4"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <p className="max-w-2xl text-xs leading-snug text-[#4a5568] sm:text-sm sm:leading-relaxed">
        We use analytics cookies to understand how you use LWYRD and improve the platform.
        No personal data (name or email) is shared.{" "}
        <a href="/privacy" className="text-[#002452] font-medium underline hover:opacity-75">
          Privacy Policy
        </a>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={decline}
          className="min-h-10 flex-1 rounded-lg border border-[#ddd7cc] px-4 py-2 text-sm text-[#002452] transition-colors hover:bg-[#f0eee7] sm:flex-none sm:rounded-xl"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="min-h-10 flex-1 rounded-lg bg-[#002452] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex-none sm:rounded-xl"
          style={{ backgroundColor: "#002452", color: "#ffffff" }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
