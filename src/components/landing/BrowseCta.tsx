"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export default function BrowseCta() {
  const { isAuthenticated, openModal } = useAuth();
  const router = useRouter();

  const handleBrowse = () => {
    if (isAuthenticated) {
      router.push("/intake");
    } else {
      openModal("login", "/intake");
    }
  };

  return (
    <section className="bg-[#002452] py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease }}
        className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div>
          <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-2">
            Get Started
          </p>
          <h2
            className="text-white text-2xl sm:text-3xl leading-snug"
            style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
          >
            Find the right firm for your situation
          </h2>
        </div>

        <button
          onClick={handleBrowse}
          className="shrink-0 inline-flex items-center gap-2 bg-white text-[#002452] text-sm font-medium px-7 py-3.5 rounded-2xl hover:bg-[#f5f4f0] active:bg-[#ddd7cc] transition-colors"
        >
          Get Matched
          <ArrowRight size={15} strokeWidth={1.5} />
        </button>
      </motion.div>
    </section>
  );
}
