"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function FinalCta() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetMatched = () => {
    router.push(isAuthenticated ? "/intake/start" : "/get-matched");
  };

  return (
    <section className="bg-[#141C2E] py-32 px-6 border-t border-[#1F2A3D]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#E6EAF2] leading-tight mb-5">
          Your situation has a right answer.
          <br />
          Let&apos;s find it.
        </h2>
        <p className="text-[#8A93A6] text-base leading-relaxed mb-10">
          About five minutes, no legal jargon, no cost to get matched.
        </p>
        <button
          onClick={handleGetMatched}
          className="inline-flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white px-8 py-4 rounded-full text-base font-medium transition-colors"
        >
          Get Matched
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}
