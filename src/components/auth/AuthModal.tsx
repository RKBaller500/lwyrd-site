"use client";

import "./auth-modal.css";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";
import { ArrowLeft } from "lucide-react";

export default function AuthModal() {
  const { isModalOpen, modalMode, closeModal, login, signup, forgotPassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(modalMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveTab(modalMode);
      setError("");
      setForgotSent(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [modalMode, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (activeTab === "login") {
        await login(email, password);
      } else if (activeTab === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }
        await signup(name, email, password, "client");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotLoading(true);
    try {
      await forgotPassword(email);
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const panel = "auth-modal bg-white";
  const closeIcon = "text-[#6B6B70]";

  if (activeTab === "forgot") {
    return (
      <Modal isOpen={isModalOpen} onClose={closeModal} panelClassName={panel} closeIconClassName={closeIcon}>
        <button type="button" className="am-back" onClick={() => { setActiveTab("login"); setError(""); setForgotSent(false); }}>
          <ArrowLeft size={14} /> Back to sign in
        </button>

        <h2>Reset your password</h2>
        <p className="am-sub">
          {forgotSent
            ? "Check your inbox — we've sent a reset link."
            : "Enter your email and we'll send you a reset link."}
        </p>

        {!forgotSent ? (
          <form onSubmit={handleForgot} className="am-form">
            <div className="field">
              <label htmlFor="am-fp-email">Email</label>
              <input
                id="am-fp-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {error && <p className="am-error">{error}</p>}
            <button type="submit" className="am-btn" disabled={forgotLoading}>
              {forgotLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <p className="am-sub">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button type="button" className="am-link" onClick={() => setForgotSent(false)} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
              try again
            </button>
            .
          </p>
        )}
      </Modal>
    );
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} panelClassName={panel} closeIconClassName={closeIcon}>
      <h2>{activeTab === "login" ? "Welcome back." : "Create your account"}</h2>
      <p className="am-sub">
        {activeTab === "login"
          ? "Sign in to access your LWYRD dashboard."
          : "Join LWYRD to find the right legal partner."}
      </p>

      <div className="auth-tabs" role="tablist">
        {(["login", "signup"] as const).map((tab) => (
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

      <form onSubmit={handleSubmit} className="am-form">
        {activeTab === "signup" && (
          <>
            <div className="field">
              <label htmlFor="am-name">Full name</label>
              <input
                id="am-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="am-email">Email</label>
          <input
            id="am-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="am-password">Password</label>
          <input
            id="am-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
          />
          {activeTab === "login" ? (
            <button type="button" className="field-hint am-link" onClick={() => { setActiveTab("forgot"); setError(""); }}>
              Forgot your password?
            </button>
          ) : (
            <p className="field-hint" style={{ cursor: "default" }}>Must be at least 8 characters.</p>
          )}
        </div>

        {error && <p className="am-error">{error}</p>}

        <button type="submit" className="am-btn" disabled={isLoading}>
          {isLoading
            ? activeTab === "login" ? "Signing in…" : "Creating account…"
            : activeTab === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="am-note">Your information is secured and never shared.</p>
    </Modal>
  );
}
