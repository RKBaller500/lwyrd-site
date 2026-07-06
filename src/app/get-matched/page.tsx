"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-[#1F2A3D] bg-[#141C2E] text-[#E6EAF2] placeholder-[#8A93A6] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 transition-colors text-sm";

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 rounded-full border-2 border-[#1F2A3D] border-t-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {activeTab === "forgot" ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease }}
            >
              <button
                onClick={() => { setActiveTab("login"); setError(""); setForgotSent(false); }}
                className="inline-flex items-center gap-1.5 text-[#8A93A6] text-xs mb-8 hover:text-[#C8CDD8] transition-colors"
              >
                <ArrowLeft size={13} />
                Back to sign in
              </button>

              <div className="mb-8">
                <h1
                  className="text-3xl text-[#E6EAF2] mb-2"
                  style={{ ...lora, fontWeight: 500 }}
                >
                  Reset your password
                </h1>
                <p className="text-[#8A93A6] text-sm">
                  {forgotSent
                    ? "Check your inbox, we've sent a reset link."
                    : "Enter your email and we'll send you a link."}
                </p>
              </div>

              {!forgotSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
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
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-white text-[#0A0F1C] text-sm font-medium hover:bg-[#E6EAF2] transition-colors disabled:opacity-50 mt-1"
                  >
                    {isLoading ? "Sending…" : "Send Reset Link"}
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
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease }}
            >
              <div className="mb-8">
                <p className="text-[#C9962B] text-xs font-semibold tracking-widest uppercase mb-3">
                  Get Matched
                </p>
                <h1
                  className="text-3xl text-[#E6EAF2] mb-2"
                  style={{ ...lora, fontWeight: 500 }}
                >
                  {activeTab === "login" ? "Welcome back." : "Find the right firm."}
                </h1>
                <p className="text-[#8A93A6] text-sm">
                  {activeTab === "login"
                    ? "Sign in to continue to your dashboard."
                    : "Create a free account to start your intake."}
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex rounded-2xl bg-[#0A0F1C] p-1 mb-6 border border-[#1F2A3D]">
                {(["signup", "login"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setError(""); }}
                    className={`flex-1 py-2.5 text-sm rounded-xl transition-all font-medium ${
                      activeTab === tab
                        ? "bg-[#141C2E] text-[#E6EAF2] shadow-sm border border-[#1F2A3D]"
                        : "text-[#8A93A6] hover:text-[#C8CDD8]"
                    }`}
                  >
                    {tab === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {activeTab === "signup" && (
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    autoComplete="name"
                    required
                  />
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
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-white text-[#0A0F1C] text-sm font-medium hover:bg-[#E6EAF2] active:bg-[#C8CDD8] transition-colors disabled:opacity-50 mt-1"
                >
                  {isLoading
                    ? activeTab === "login" ? "Signing in…" : "Creating account…"
                    : activeTab === "login" ? "Sign In" : "Create Account & Continue →"}
                </button>
              </form>

              <p className="text-center text-xs text-[#8A93A6] mt-5">
                Your information is secured and never shared.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function GetMatchedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0F1C]">
      <Navbar />
      <Suspense>
        <GetMatchedForm />
      </Suspense>
      <Footer />
    </div>
  );
}
