"use client";

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
  const [role, setRole] = useState<"client" | "firm">("client");
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    setActiveTab(modalMode);
    setError("");
    setForgotSent(false);
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
        await signup(name, email, password, role);
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

  const inputClass =
    "w-full px-4 py-3 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";

  if (activeTab === "forgot") {
    return (
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <button
          onClick={() => { setActiveTab("login"); setError(""); setForgotSent(false); }}
          className="inline-flex items-center gap-1.5 text-slate-400 text-xs mb-6 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to sign in
        </button>

        <div className="mb-6">
          <h2
            className="text-2xl text-[#002452] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Reset your password
          </h2>
          <p className="text-slate-500 text-sm">
            {forgotSent
              ? "Check your inbox — we've sent a reset link."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!forgotSent ? (
          <form onSubmit={handleForgot} className="space-y-3">
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              required
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
            >
              {forgotLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <p className="text-slate-500 text-sm">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setForgotSent(false)}
              className="text-[#002452] underline underline-offset-2"
            >
              try again
            </button>
            .
          </p>
        )}
      </Modal>
    );
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <div className="mb-6">
        <h2
          className="text-2xl text-[#002452] mb-1"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {activeTab === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-slate-500 text-sm">
          {activeTab === "login"
            ? "Sign in to access your LWYRD dashboard."
            : "Join LWYRD to find the right legal partner."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-2xl bg-[#f5f4f0] p-1 mb-6 border border-[#ddd7cc]">
        {(["login", "signup"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(""); }}
            className={`flex-1 py-2 text-sm rounded-xl transition-all font-medium ${
              activeTab === tab
                ? "bg-[#002452] text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "login" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {activeTab === "signup" && (
          <>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              required
            />

            {/* Role selector */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 ml-1">I am:</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "client", label: "Looking for legal help" },
                  { value: "firm", label: "A law firm" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`py-2.5 px-3 rounded-2xl border text-sm transition-all ${
                      role === opt.value
                        ? "border-[#002452] bg-[#002452] text-white"
                        : "border-[#ddd7cc] bg-white text-slate-600 hover:border-[#002452]/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 ml-1">
                Role cannot be changed after account creation.
              </p>
            </div>
          </>
        )}

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
          required
        />
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
          />
          {activeTab === "login" && (
            <button
              type="button"
              onClick={() => { setActiveTab("forgot"); setError(""); }}
              className="text-xs text-slate-400 mt-1.5 ml-1 hover:text-[#002452] transition-colors"
            >
              Forgot your password?
            </button>
          )}
          {activeTab === "signup" && (
            <p className="text-xs text-slate-400 mt-1.5 ml-1">Must be at least 6 characters.</p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
        >
          {isLoading
            ? activeTab === "login"
              ? "Signing in…"
              : "Creating account…"
            : activeTab === "login"
            ? "Sign In"
            : "Create Account"}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-4">
        Your information is secured and never shared.
      </p>
    </Modal>
  );
}
