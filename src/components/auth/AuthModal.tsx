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
    "w-full px-4 py-3 rounded-2xl border border-[#1F2A3D] bg-[#141C2E] text-[#E6EAF2] placeholder-[#8A93A6] focus:outline-none focus:border-[#3B82F6] transition-colors text-sm";

  if (activeTab === "forgot") {
    return (
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <button
          onClick={() => { setActiveTab("login"); setError(""); setForgotSent(false); }}
          className="inline-flex items-center gap-1.5 text-[#8A93A6] text-xs mb-6 hover:text-[#C8CDD8] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to sign in
        </button>

        <div className="mb-6">
          <h2
            className="text-2xl text-[#E6EAF2] mb-1"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Reset your password
          </h2>
          <p className="text-[#8A93A6] text-sm">
            {forgotSent
              ? "Check your inbox, we've sent a reset link."
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
          <p className="text-[#8A93A6] text-sm">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setForgotSent(false)}
              className="text-[#E6EAF2] underline underline-offset-2"
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
          className="text-2xl text-[#E6EAF2] mb-1"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {activeTab === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="text-[#8A93A6] text-sm">
          {activeTab === "login"
            ? "Sign in to access your LWYRD dashboard."
            : "Join LWYRD to find the right legal partner."}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-2xl bg-[#0A0F1C]/60 p-1 mb-6 border border-[#1F2A3D]">
        {(["login", "signup"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setError(""); }}
            className={`flex-1 py-2 text-sm rounded-xl transition-all font-medium ${
              activeTab === tab
                ? "bg-[#002452] text-white shadow-sm"
                : "text-[#8A93A6] hover:text-[#C8CDD8]"
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
              <p className="text-xs font-medium text-[#8A93A6] mb-2 ml-1">I am:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`py-2.5 px-3 rounded-2xl border text-sm transition-all ${
                    role === "client"
                      ? "border-[#002452] bg-[#002452] text-white"
                      : "border-[#1F2A3D] bg-[#0A0F1C] text-[#C8CDD8] hover:border-[#3B82F6]/40"
                  }`}
                >
                  Looking for legal help
                </button>
                <div className="relative">
                  <div className="py-2.5 px-3 rounded-2xl border border-[#1F2A3D] bg-[#0A0F1C] text-sm text-slate-300 cursor-not-allowed select-none">
                    A law firm
                  </div>
                  <span className="absolute -top-2 -right-1 text-[10px] font-medium bg-[#002452] text-white px-2 py-0.5 rounded-full leading-none">
                    Coming soon
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8A93A6] mt-1.5 ml-1">
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
            minLength={8}
          />
          {activeTab === "login" && (
            <button
              type="button"
              onClick={() => { setActiveTab("forgot"); setError(""); }}
              className="text-xs text-[#8A93A6] mt-1.5 ml-1 hover:text-[#E6EAF2] transition-colors"
            >
              Forgot your password?
            </button>
          )}
          {activeTab === "signup" && (
            <p className="text-xs text-[#8A93A6] mt-1.5 ml-1">Must be at least 8 characters.</p>
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

      <p className="text-center text-xs text-[#8A93A6] mt-4">
        Your information is secured and never shared.
      </p>
    </Modal>
  );
}
