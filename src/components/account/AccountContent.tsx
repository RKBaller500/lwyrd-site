"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Shield, ArrowRight, User, Bookmark, Lock, LogOut } from "lucide-react";
import SaveFirmButton from "@/components/firms/SaveFirmButton";
import { updateProfile } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

interface FirmSummary {
  id: string;
  name: string;
  tagline: string;
  location: string;
  size: string;
  overall_score: number;
  verified: boolean;
}

interface SavedFirmEntry {
  savedAt: string;
  firm: FirmSummary;
}

interface AccountContentProps {
  profile: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    accessLevel: "none" | "subscription" | "org";
  };
  savedFirms: SavedFirmEntry[];
}

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

const accessLevelLabels: Record<string, string> = {
  none: "Free",
  subscription: "Subscription",
  org: "Organization",
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

function formatMemberSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";

export default function AccountContent({ profile, savedFirms }: AccountContentProps) {
  const { logout } = useAuth();

  // Profile form
  const [name, setName] = useState(profile.name);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password reset
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isResetPending, setIsResetPending] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    startProfileTransition(async () => {
      const result = await updateProfile(name);
      setProfileMessage(
        result.error
          ? { type: "error", text: result.error }
          : { type: "success", text: "Profile updated." }
      );
    });
  };

  const handlePasswordReset = async () => {
    setResetMessage(null);
    setIsResetPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/account`,
    });
    setIsResetPending(false);
    setResetMessage(
      error
        ? { type: "error", text: error.message }
        : { type: "success", text: "Check your inbox for a password reset link." }
    );
  };

  return (
    <motion.div className="space-y-12" variants={container} initial="hidden" animate="visible">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-4xl sm:text-5xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
          My Account
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Manage your saved firms and profile settings.
        </p>
      </motion.div>

      {/* ── Section 1: Saved Firms ─────────────────────────────── */}
      <motion.section variants={item}>
        <div className="flex items-center gap-2 mb-5">
          <Bookmark size={18} className="text-[#002452]" strokeWidth={1.5} />
          <h2 className="text-2xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
            Saved Firms
          </h2>
          {savedFirms.length > 0 && (
            <span className="ml-1 text-xs bg-[#002452]/10 text-[#002452] px-2 py-0.5 rounded-full">
              {savedFirms.length}
            </span>
          )}
        </div>

        {savedFirms.length === 0 ? (
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-10 text-center">
            <Bookmark size={28} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-slate-500 text-sm mb-4">You haven&apos;t saved any firms yet.</p>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 text-sm text-[#002452] font-medium hover:underline"
            >
              Get matched
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {savedFirms.map(({ firm }) => (
              <div
                key={firm.id}
                className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {firm.verified && (
                      <div className="inline-flex items-center gap-1 text-[#002452] text-xs font-medium mb-2">
                        <Shield size={11} />
                        LWYRD Verified
                      </div>
                    )}
                    <h3 className="text-[#002452] text-xl leading-snug" style={{ ...lora, fontWeight: 500 }}>
                      {firm.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{firm.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-3xl text-[#002452]" style={lora}>
                      {firm.overall_score}
                    </div>
                    <div className="text-xs text-slate-400">score</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {firm.location}
                  </span>
                  <span>{sizeLabels[firm.size] ?? firm.size} firm</span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <SaveFirmButton firmId={firm.id} initialSaved={true} compact />
                  <Link
                    href={`/firms/${firm.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    View Profile
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ── Section 2: Profile Settings ───────────────────────── */}
      <motion.section variants={item}>
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-[#002452]" strokeWidth={1.5} />
          <h2 className="text-2xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
            Profile Settings
          </h2>
        </div>

        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 max-w-md">
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-[#f5f4f0] text-slate-400 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
            </div>

            {/* Account info */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Member since</p>
                <p className="text-sm text-slate-600">{formatMemberSince(profile.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Plan</p>
                <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[#002452]/10 text-[#002452]">
                  {accessLevelLabels[profile.accessLevel]}
                </span>
              </div>
            </div>

            {profileMessage && (
              <p className={`text-sm ${profileMessage.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                {profileMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isProfilePending}
              className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isProfilePending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </motion.section>

      {/* ── Section 3: Security ───────────────────────────────── */}
      <motion.section variants={item}>
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-[#002452]" strokeWidth={1.5} />
          <h2 className="text-2xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
            Security
          </h2>
        </div>

        <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-8 max-w-md space-y-4">
          <div>
            <p className="text-sm text-slate-700 font-medium">Password</p>
            <p className="text-xs text-slate-400 mt-0.5">
              We&apos;ll send a reset link to <span className="text-slate-500">{profile.email}</span>.
            </p>
          </div>

          {resetMessage && (
            <p className={`text-sm ${resetMessage.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
              {resetMessage.text}
            </p>
          )}

          <button
            onClick={handlePasswordReset}
            disabled={isResetPending || resetMessage?.type === "success"}
            className="w-full py-3 rounded-2xl border border-[#002452] text-[#002452] text-sm font-medium hover:bg-[#002452] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetPending ? "Sending..." : "Send Password Reset Email"}
          </button>
        </div>
      </motion.section>

      {/* ── Sign out ──────────────────────────────────────────── */}
      <motion.div variants={item} className="pb-4">
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </motion.div>
    </motion.div>
  );
}
