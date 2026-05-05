"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

export default function FinalCta() {
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
    <section className="bg-[#f5f4f0] py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2
          className="text-[#002452] text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5"
          style={{ ...lora, fontWeight: 500 }}
        >
          Your situation has a right answer.
          <br />
          Let&apos;s find it.
        </h2>
        <p className="text-slate-500 text-base leading-relaxed mb-10">
          Start the intake, about five minutes, no legal jargon, no cost to get matched.
        </p>
        <button
          onClick={handleGetMatched}
          className="inline-flex items-center justify-center gap-2 bg-[#002452] text-white px-8 py-4 rounded-2xl text-base font-medium hover:opacity-90 active:opacity-75 transition-opacity"
        >
          Get Matched
          <ArrowRight size={16} />
        </button>
      </motion.div>
    </section>
  );
}
