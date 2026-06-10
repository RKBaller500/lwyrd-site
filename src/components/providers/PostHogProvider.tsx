"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ConsentProvider } from "@/context/ConsentContext";

const CONSENT_KEY = "lwyrd_analytics_consent";

function initPostHog() {
  if (process.env.NEXT_PUBLIC_POSTHOG_ENABLED !== "true") return;
  if (posthog.__loaded) return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: "identified_only",
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      if (searchParams.toString()) url += `?${searchParams.toString()}`;
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize on mount if consent was previously granted
    if (localStorage.getItem(CONSENT_KEY) === "true") {
      initPostHog();
    }
  }, []);

  // Called by ConsentBanner via context — no global event bus
  const handleConsent = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, "true");
    initPostHog();
  }, []);

  return (
    <PHProvider client={posthog}>
      <ConsentProvider onConsent={handleConsent}>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {children}
      </ConsentProvider>
    </PHProvider>
  );
}
