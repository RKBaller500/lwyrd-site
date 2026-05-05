"use client";

import { motion } from "framer-motion";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

export default function SocialProof() {
  return (
    <section className="bg-[#002452] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="border-t border-white/15 pt-14"
        >
          <p className="text-white/50 text-xs font-medium tracking-widest uppercase mb-10">
            In Their Own Words
          </p>

          <blockquote
            className="text-white text-2xl sm:text-3xl leading-relaxed mb-8"
            style={{ ...lora, fontWeight: 400 }}
          >
            &ldquo;We had a legal issue come up and had no idea where to start. LWYRD helped us figure out what we actually needed and connected us with the right firm. It made a genuinely stressful process much more manageable.&rdquo;
          </blockquote>

          <p className="text-white/50 text-sm">Small business owner</p>
        </motion.div>
      </div>
    </section>
  );
}
