"use client";

import { useEffect, useState } from "react";
import { useConsent } from "@/context/ConsentContext";

const CONSENT_KEY = "lwyrd_analytics_consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const { grantConsent } = useConsent();

  useEffect(() => {
    if (localStorage.getItem(CONSENT_KEY) === null) {
      setVisible(true);
    }
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
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#fbfaf6] border-t border-[#ddd7cc] px-4 py-4 shadow-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <p className="text-sm leading-relaxed text-[#4a5568] max-w-2xl">
        We use analytics cookies to understand how you use LWYRD and improve the platform.
        No personal data (name or email) is shared.{" "}
        <a href="/privacy" className="text-[#002452] font-medium underline hover:opacity-75">
          Privacy Policy
        </a>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={decline}
          className="flex-1 sm:flex-none px-4 py-2 text-sm text-[#002452] border border-[#ddd7cc] rounded-xl hover:bg-[#f0eee7] transition-colors"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-[#002452] rounded-xl hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
