"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, openModal } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openModal("login");
    }
  }, [isAuthenticated, isLoading, openModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#002452]/20 border-t-[#002452] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#002452]/20 border-t-[#002452] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
