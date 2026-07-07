"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Lock, LogOut, AlertTriangle, Trash2 } from "lucide-react";
import { updateProfile, deleteAccount } from "@/lib/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

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
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/");
    });
  };

  const msgColor = (t: "success" | "error") => (t === "success" ? "#0f7a3d" : "#b42318");

  return (
    <motion.div style={{ display: "grid", gap: 48 }} variants={container} initial="hidden" animate="visible">
      {/* Page header */}
      <motion.div variants={item} className="app-head">
        <h1>My Account</h1>
        <p>Manage your profile settings and account security.</p>
      </motion.div>

      {/* ── Profile Settings ───────────────────────────────── */}
      <motion.section variants={item}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <User size={18} strokeWidth={1.6} style={{ color: "var(--navy)" }} />
          <h2 style={{ fontSize: "1.4rem" }}>Profile Settings</h2>
        </div>

        <div className="ds-card" style={{ maxWidth: 460 }}>
          <form onSubmit={handleProfileSave} style={{ display: "grid", gap: 18 }}>
            <div className="field">
              <label>Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            </div>

            <div className="field">
              <label>Email</label>
              <input type="email" value={profile.email} disabled style={{ background: "var(--paper-alt)", color: "var(--muted)", cursor: "not-allowed" }} />
              <p className="field-hint">Email cannot be changed here.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 2 }}>
              <div>
                <p style={{ fontSize: ".78rem", color: "var(--faint)", fontWeight: 600, marginBottom: 4 }}>Member since</p>
                <p style={{ fontSize: ".9rem", color: "var(--ink-2)" }}>{formatMemberSince(profile.createdAt)}</p>
              </div>
              <div>
                <p style={{ fontSize: ".78rem", color: "var(--faint)", fontWeight: 600, marginBottom: 4 }}>Plan</p>
                <span className="chip" style={{ color: "var(--navy)", background: "var(--navy-tint)", borderColor: "var(--navy-tint-2)" }}>
                  {accessLevelLabels[profile.accessLevel]}
                </span>
              </div>
            </div>

            {profileMessage && (
              <p style={{ fontSize: ".9rem", color: msgColor(profileMessage.type) }}>{profileMessage.text}</p>
            )}

            <button type="submit" disabled={isProfilePending} className="btn btn-primary" style={{ justifyContent: "center", opacity: isProfilePending ? 0.5 : 1 }}>
              {isProfilePending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </motion.section>

      {/* ── Security ───────────────────────────────── */}
      <motion.section variants={item}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Lock size={18} strokeWidth={1.6} style={{ color: "var(--navy)" }} />
          <h2 style={{ fontSize: "1.4rem" }}>Security</h2>
        </div>

        <div className="ds-card" style={{ maxWidth: 460, display: "grid", gap: 16 }}>
          <div>
            <p style={{ fontSize: ".92rem", color: "var(--ink)", fontWeight: 600 }}>Password</p>
            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 2 }}>
              We&apos;ll send a reset link to {profile.email}.
            </p>
          </div>

          {resetMessage && (
            <p style={{ fontSize: ".9rem", color: msgColor(resetMessage.type) }}>{resetMessage.text}</p>
          )}

          <button
            onClick={handlePasswordReset}
            disabled={isResetPending || resetMessage?.type === "success"}
            className="btn btn-outline"
            style={{ justifyContent: "center", opacity: isResetPending || resetMessage?.type === "success" ? 0.5 : 1 }}
          >
            {isResetPending ? "Sending..." : "Send Password Reset Email"}
          </button>
        </div>
      </motion.section>

      {/* ── Sign out ──────────────────────────────────────────── */}
      <motion.div variants={item}>
        <button onClick={() => logout()} className="btn btn-ghost" style={{ color: "var(--muted)" }}>
          <LogOut size={14} strokeWidth={1.6} /> Sign out
        </button>
      </motion.div>

      {/* ── Danger Zone ───────────────────────────────────────── */}
      <motion.section variants={item}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <AlertTriangle size={18} strokeWidth={1.6} style={{ color: "#b42318" }} />
          <h2 style={{ fontSize: "1.4rem", color: "#b42318" }}>Danger Zone</h2>
        </div>

        <div style={{ maxWidth: 460, border: "1px solid #f6cfca", borderRadius: 18, padding: "clamp(22px,3vw,32px)", background: "#fdf4f3" }}>
          {!showDeleteConfirm ? (
            <div>
              <p style={{ fontSize: ".92rem", color: "var(--ink)", fontWeight: 600, marginBottom: 4 }}>Delete Account</p>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
                Permanently delete your account and all associated data, including your intake history,
                saved firms, and profile information. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn"
                style={{ border: "1px solid #e0a5a0", color: "#b42318", background: "#fff" }}
              >
                <Trash2 size={14} strokeWidth={1.6} /> Delete Account
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "#fbe9e7", border: "1px solid #f6cfca" }}>
                <p style={{ fontSize: ".9rem", color: "#8a2018", fontWeight: 600, marginBottom: 4 }}>This cannot be undone</p>
                <p style={{ fontSize: ".8rem", color: "#a5352c", lineHeight: 1.6 }}>
                  All of your data will be permanently removed: intake submissions, saved firms,
                  match history, and your account credentials. There is no recovery option.
                </p>
              </div>

              <div className="field">
                <label>
                  Type <span style={{ fontWeight: 700, color: "#b42318" }}>DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  autoComplete="off"
                />
              </div>

              {deleteMessage?.type === "error" && (
                <p style={{ fontSize: ".9rem", color: "#b42318" }}>{deleteMessage.text}</p>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteMessage(null);
                  }}
                  disabled={isDeletePending}
                  className="btn btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || isDeletePending}
                  className="btn"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    background: "#b42318",
                    color: "#fff",
                    opacity: deleteConfirmText !== "DELETE" || isDeletePending ? 0.5 : 1,
                  }}
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
