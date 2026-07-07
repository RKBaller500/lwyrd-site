"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Auth is modal-based, not a dedicated page. Any direct visit to /get-matched
 * (or old links) opens the auth modal over the homepage.
 */
function GetMatchedRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, openModal } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/intake/start");
      return;
    }
    const mode = searchParams.get("tab") === "signup" ? "signup" : "login";
    router.replace("/");
    openModal(mode, "/intake/start");
  }, [isAuthenticated, isLoading, openModal, router, searchParams]);

  return null;
}

export default function GetMatchedPage() {
  return (
    <Suspense>
      <GetMatchedRedirect />
    </Suspense>
  );
}
