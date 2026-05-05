"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { saveFirm, unsaveFirm } from "@/lib/actions/savedFirms";
import { useAuth } from "@/context/AuthContext";
import { usePostHog } from "posthog-js/react";

interface SaveFirmButtonProps {
  firmId: string;
  initialSaved?: boolean;
  compact?: boolean;
}

export default function SaveFirmButton({
  firmId,
  initialSaved = false,
  compact = false,
}: SaveFirmButtonProps) {
  const { isAuthenticated, openModal } = useAuth();
  const ph = usePostHog();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isAuthenticated) {
      openModal("login");
      return;
    }

    const nextSaved = !saved;
    setSaved(nextSaved); // optimistic update

    startTransition(async () => {
      const result = nextSaved
        ? await saveFirm(firmId)
        : await unsaveFirm(firmId);

      if (result.error) {
        setSaved(!nextSaved); // revert on error
        console.error("SaveFirmButton error:", result.error);
      } else {
        ph?.capture(nextSaved ? "firm_saved" : "firm_unsaved", { firm_id: firmId });
      }
    });
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? "Saved" : "Save";

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={saved ? "Remove from saved firms" : "Save this firm"}
        className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-colors disabled:opacity-50 ${
          saved
            ? "border-[#002452] text-[#002452] bg-[#002452]/5"
            : "border-[#ddd7cc] text-slate-400 hover:border-[#002452] hover:text-[#002452]"
        }`}
      >
        <Icon size={16} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Remove from saved firms" : "Save this firm"}
      className={`flex items-center gap-2 w-full py-3 rounded-2xl border text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "border-[#002452] text-[#002452] bg-[#002452]/5 hover:bg-[#002452]/10"
          : "border-[#ddd7cc] text-slate-600 hover:border-[#002452] hover:text-[#002452]"
      }`}
      style={{ justifyContent: "center" }}
    >
      <Icon size={15} strokeWidth={1.5} />
      {label}
    </button>
  );
}
