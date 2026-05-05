"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, openModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      openModal("login");
      return;
    }
    if (!user?.isAdmin) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, user, openModal, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Access restricted.</p>
      </div>
    );
  }

  return <>{children}</>;
}
