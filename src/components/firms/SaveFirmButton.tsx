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
        className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors disabled:opacity-50 ${
          saved
            ? "border-[#002B55] text-[#002B55] bg-[#EEF3F8]"
            : "border-[#E7E7E3] text-[#9A9AA0] hover:border-[#002B55] hover:text-[#002B55]"
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
      className={`flex items-center gap-2 w-full py-3 rounded-full border text-sm font-medium transition-colors disabled:opacity-50 ${
        saved
          ? "border-[#002B55] text-[#002B55] bg-[#EEF3F8] hover:bg-[#E1EAF3]"
          : "border-[#E7E7E3] text-[#2A2A2E] hover:border-[#002B55] hover:text-[#002B55]"
      }`}
      style={{ justifyContent: "center" }}
    >
      <Icon size={15} strokeWidth={1.5} />
      {label}
    </button>
  );
}
