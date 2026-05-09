"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-6">
      <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-10 w-full max-w-md">
        <Link
          href="/"
          className="text-[#002452] text-sm font-medium tracking-wide mb-8 inline-block"
          style={lora}
        >
          LWYRD
        </Link>

        <h1
          className="text-2xl text-[#002452] mb-1"
          style={{ ...lora, fontWeight: 500 }}
        >
          {done ? "Password updated" : "Set a new password"}
        </h1>
        <p className="text-slate-500 text-sm mb-7">
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
              minLength={6}
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
                minLength={6}
              />
              <p className="text-xs text-slate-400 mt-1.5 ml-1">Must be at least 6 characters.</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
