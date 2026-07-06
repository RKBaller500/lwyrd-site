"use client";

import "@/styles/lwyrd-ds.css";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

function GetMatchedForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, login, signup, forgotPassword } = useAuth();

  const initialTab = searchParams.get("tab") === "login" ? "login" : "signup";
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState<"client" | "firm">("client");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/intake/start");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (activeTab === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setIsLoading(false);
          return;
        }
        await signup(name, email, password, role);
      }
      router.push("/intake/start");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-wrap">
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--line)",
            borderTopColor: "var(--navy)",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (activeTab === "forgot") {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <button
            type="button"
            className="auth-back"
            onClick={() => { setActiveTab("login"); setError(""); setForgotSent(false); }}
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>

          <div className="auth-head">
            <h1>Reset your password</h1>
            <p>
              {forgotSent
                ? "Check your inbox — we've sent a reset link."
                : "Enter your email and we'll send you a link."}
            </p>
          </div>

          {!forgotSent ? (
            <form onSubmit={handleForgot} className="auth-form">
              <div className="field">
                <label htmlFor="fp-email">Email</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isLoading}>
                {isLoading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button type="button" className="auth-link" onClick={() => setForgotSent(false)} style={{ textDecoration: "underline" }}>
                try again
              </button>
              .
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <span className="kicker">Get matched</span>
          <h1>{activeTab === "login" ? "Welcome back." : "Find the right firm."}</h1>
          <p>
            {activeTab === "login"
              ? "Sign in to continue to your dashboard."
              : "Create a free account to start your intake."}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          {(["signup", "login"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`auth-tab${activeTab === tab ? " is-active" : ""}`}
              onClick={() => { setActiveTab(tab); setError(""); }}
            >
              {tab === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === "signup" && (
            <div className="field">
              <label htmlFor="au-name">Full name</label>
              <input
                id="au-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="au-email">Email</label>
            <input
              id="au-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="au-password">Password</label>
            <input
              id="au-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
            />
            {activeTab === "login" ? (
              <button
                type="button"
                className="field-hint auth-link"
                style={{ textAlign: "left", background: "none" }}
                onClick={() => { setActiveTab("forgot"); setError(""); }}
              >
                Forgot your password?
              </button>
            ) : (
              <p className="field-hint">Must be at least 8 characters.</p>
            )}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isLoading}>
            {isLoading
              ? activeTab === "login" ? "Signing in…" : "Creating account…"
              : activeTab === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-note">Your information is secured and never shared.</p>
      </div>
    </div>
  );
}

export default function GetMatchedPage() {
  return (
    <div className="lwyrd-ds ds-page">
      <MarketingNav />
      <main className="ds-main">
        <Suspense>
          <GetMatchedForm />
        </Suspense>
      </main>
      <MarketingFooter />
    </div>
  );
}
