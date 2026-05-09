"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

export default function HeroSection() {
  const { isAuthenticated, openModal } = useAuth();
  const router = useRouter();

  const handleGetMatched = () => {
    if (isAuthenticated) {
      router.push("/intake/start");
    } else {
      openModal("login", "/intake/start");
    }
  };

  return (
    <section className="relative bg-[#f5f4f0] py-32 md:py-44 px-6 text-center overflow-hidden">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        className="absolute -top-10 -right-8 text-[28rem] leading-none text-[#002452] pointer-events-none select-none"
        style={{ ...lora, fontWeight: 600 }}
        aria-hidden="true"
      >
        L
      </motion.span>

      <div className="max-w-4xl mx-auto relative">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#002452] leading-tight mb-8"
          style={{ ...lora, fontWeight: 500 }}
        >
          Making Specialized Legal
          <br />
          Services Accessible
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
        >
          LWYRD helps startups, SMBs, and individuals get access to specialized legal help through our curated network of vetted law firms and guided tools that help you understand your legal needs before hiring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.22 }}
        >
          <button
            onClick={handleGetMatched}
            className="inline-flex items-center justify-center gap-2 bg-[#002452] text-white px-8 py-4 rounded-2xl text-base font-medium hover:opacity-90 active:opacity-75 transition-opacity"
          >
            Get Matched
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
