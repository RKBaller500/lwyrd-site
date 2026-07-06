"use client";

import "@/styles/lwyrd-ds.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
    <div className="lwyrd-ds ds-page">
      <div className="auth-wrap">
        <div className="auth-card">
          <Link href="/" className="brand" aria-label="LWYRD home" style={{ display: "inline-block", marginBottom: "1.4rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/Logos/LWYRD_Navy.png" alt="LWYRD" style={{ height: 22, width: "auto" }} />
          </Link>

          {sessionReady === null && (
            <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--muted)", fontSize: ".9rem" }}>
              Loading…
            </div>
          )}

          {sessionReady === false && (
            <div className="auth-head">
              <h1>Link expired</h1>
              <p style={{ marginBottom: "1.6rem" }}>
                This reset link has expired or has already been used. Password reset
                links are only valid for one hour.
              </p>
              <Link href="/get-matched?tab=login" className="btn btn-primary" style={{ justifyContent: "center" }}>
                Back to sign in
              </Link>
            </div>
          )}

          {sessionReady === true && (
            <>
              <div className="auth-head">
                <span className="kicker">Account</span>
                <h1>{done ? "Password updated" : "Set a new password"}</h1>
                <p>
                  {done
                    ? "You're all set. Redirecting you now…"
                    : "Choose a new password for your account."}
                </p>
              </div>

              {!done && (
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="field">
                    <label htmlFor="rp-password">New password</label>
                    <input
                      id="rp-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="rp-confirm">Confirm new password</label>
                    <input
                      id="rp-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <p className="field-hint">Must be at least 8 characters.</p>
                  </div>

                  {error && <p className="auth-error">{error}</p>}

                  <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                    {loading ? "Updating…" : "Update password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
