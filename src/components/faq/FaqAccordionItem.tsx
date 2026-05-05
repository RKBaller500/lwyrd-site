"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

interface FaqAccordionItemProps {
  question: string;
  answer: string | React.ReactNode;
  isLast?: boolean;
}

export default function FaqAccordionItem({ question, answer, isLast }: FaqAccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={!isLast ? "border-b border-[#ddd7cc]" : ""}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left hover:bg-[#002452]/3 transition-colors"
      >
        <span
          className="text-[#002452] text-base"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown size={18} strokeWidth={1.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-7 pb-5 text-slate-500 text-sm leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
