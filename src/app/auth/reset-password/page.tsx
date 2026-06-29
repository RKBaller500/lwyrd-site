"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#1F2A3D] bg-[#141C2E] text-[#C8CDD8] placeholder-[#8A93A6] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 transition-colors text-sm";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(!!session);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-6">
      <div className="bg-[#141C2E] border border-[#1F2A3D] rounded-3xl p-10 w-full max-w-md">
        <Link
          href="/"
          className="text-[#E6EAF2] text-sm font-medium tracking-wide mb-8 inline-block"
          style={lora}
        >
          LWYRD
        </Link>

        {sessionReady === null && (
          <div className="py-8 text-center text-[#8A93A6] text-sm">Loading…</div>
        )}

        {sessionReady === false && (
          <>
            <h1
              className="text-2xl text-[#E6EAF2] mb-2"
              style={{ ...lora, fontWeight: 500 }}
            >
              Link expired
            </h1>
            <p className="text-[#8A93A6] text-sm mb-7">
              This reset link has expired or has already been used. Password reset links are only valid for one hour.
            </p>
            <Link
              href="/"
              className="inline-block py-3 px-6 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to homepage
            </Link>
          </>
        )}

        {sessionReady === true && (
          <>
            <h1
              className="text-2xl text-[#E6EAF2] mb-1"
              style={{ ...lora, fontWeight: 500 }}
            >
              {done ? "Password updated" : "Set a new password"}
            </h1>
            <p className="text-[#8A93A6] text-sm mb-7">
              {done
                ? "You're all set. Redirecting you now…"
                : "Choose a new password for your account."}
            </p>

            {!done && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-[#8A93A6] mt-1.5 ml-1">Must be at least 8 characters.</p>
                </div>

                {error && (
                  <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
