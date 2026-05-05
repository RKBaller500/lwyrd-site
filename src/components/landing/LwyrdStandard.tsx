"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const criteria = [
  "Bar standing and disciplinary history verified",
  "Depth of experience in core practice areas confirmed",
  "Client responsiveness commitments required",
  "Written engagement agreements standard",
  "Upfront fee disclosure required",
  "No pay-to-appear model",
];

export default function LwyrdStandard() {
  return (
    <section className="bg-[#f5f4f0] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="text-slate-400 text-xs font-medium tracking-widest uppercase mb-3">
              Our Standard
            </p>
            <h2
              className="text-[#002452] text-3xl sm:text-4xl leading-tight mb-6"
              style={{ ...lora, fontWeight: 500 }}
            >
              What does it mean to meet the LWYRD standard?
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Before any firm appears in a match result, it passes a rigorous evaluation. A firm that earns a place in the LWYRD network has demonstrated bar standing, practice depth, and a commitment to the standards clients deserve. That evaluation is ongoing. The result is a network where every firm you see has already been held to account.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease, delay: 0.08 }}
            className="space-y-3"
          >
            {criteria.map((c) => (
              <div key={c} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#002452] mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-slate-600 text-sm leading-snug">{c}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
