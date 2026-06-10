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
    // grantConsent() writes "true" to localStorage and inits PostHog via React context —
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
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#ddd7cc] px-6 py-4 shadow-lg sm:flex sm:items-center sm:justify-between gap-6"
    >
      <p className="text-sm text-slate-600 mb-3 sm:mb-0">
        We use analytics cookies to understand how you use Lwyrd and improve the platform.
        No personal data (name or email) is shared.{" "}
        <a href="/privacy" className="text-[#002452] underline hover:opacity-75">
          Privacy Policy
        </a>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={decline}
          className="px-4 py-2 text-sm text-slate-600 border border-[#ddd7cc] rounded-xl hover:bg-[#f5f4f0] transition-colors"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="px-4 py-2 text-sm font-medium text-white bg-[#002452] rounded-xl hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
