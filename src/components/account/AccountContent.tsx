"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Lock, LogOut, AlertTriangle, Trash2 } from "lucide-react";
import { updateProfile, deleteAccount } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

interface AccountContentProps {
  profile: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    accessLevel: "none" | "subscription" | "org";
  };
}

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

export default function AccountContent({ profile }: AccountContentProps) {
  const { logout } = useAuth();
  const router = useRouter();

  // Profile form
  const [name, setName] = useState(profile.name);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  // Password reset
  const [resetMessage, setResetMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isResetPending, setIsResetPending] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();

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

  const handleDeleteAccount = () => {
    setDeleteMessage(null);
    startDeleteTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        setDeleteMessage({ type: "error", text: result.error });
        return;
      }
      // Clear local session then redirect to home
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/");
    });
  };

  return (
    <motion.div className="space-y-12" variants={container} initial="hidden" animate="visible">
      {/* Page header */}
      <motion.div variants={item}>
        <h1 className="text-4xl sm:text-5xl text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
          My Account
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Manage your profile settings and account security.
        </p>
      </motion.div>

      {/* ── Profile Settings ───────────────────────────────── */}
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

      {/* ── Security ───────────────────────────────── */}
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
      <motion.div variants={item}>
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </motion.div>

      {/* ── Danger Zone ───────────────────────────────────────── */}
      <motion.section variants={item}>
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} className="text-red-500" strokeWidth={1.5} />
          <h2 className="text-2xl text-red-600" style={{ ...lora, fontWeight: 500 }}>
            Danger Zone
          </h2>
        </div>

        <div className="border border-red-200 rounded-3xl p-8 max-w-md bg-red-50/40">
          {!showDeleteConfirm ? (
            <div>
              <p className="text-sm text-slate-700 font-medium mb-1">Delete Account</p>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Permanently delete your account and all associated data — including your intake history,
                saved firms, and profile information. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-red-400 text-red-600 text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 size={14} strokeWidth={1.5} />
                Delete Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-100/60 border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-1">This cannot be undone</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  All of your data will be permanently removed: intake submissions, saved firms,
                  match history, and your account credentials. There is no recovery option.
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1.5">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-3 rounded-2xl border border-red-300 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-red-500 transition-colors text-sm"
                  autoComplete="off"
                />
              </div>

              {deleteMessage?.type === "error" && (
                <p className="text-sm text-red-500">{deleteMessage.text}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteMessage(null);
                  }}
                  disabled={isDeletePending}
                  className="flex-1 py-2.5 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeletePending}
                  className="flex-1 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDeletePending ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
