"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FaqAccordionItem from "@/components/faq/FaqAccordionItem";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

type Tab = "general" | "clients" | "firms";
type FaqItem = { q: string; a: string | React.ReactNode };

const faqData: Record<Tab, FaqItem[]> = {
  general: [
    {
      q: "What is LWYRD?",
      a: "LWYRD is a legal matchmaking platform. We guide individuals and organizations through a structured intake process to understand their legal situation, then connect them with vetted law firms best suited to their specific needs. We are not a law firm and do not provide legal advice.",
    },
    {
      q: "Is LWYRD free to use?",
      a: "Yes, creating an account, completing the intake, and receiving your matched firm results are all free. There is no cost to get matched.",
    },
    {
      q: "Is LWYRD a law firm?",
      a: "No. LWYRD is not a law firm and does not practice law. We do not provide legal advice, represent clients, or establish attorney-client relationships. Our role is to help people find the right specialist, nothing more.",
    },
    {
      q: "Do I need an account to use LWYRD?",
      a: "You need a free account to complete the intake and receive your matches.",
    },
    {
      q: "Who does LWYRD serve?",
      a: "LWYRD serves startups (entity formation, fundraising, IP, equity), small businesses (contracts, employment, commercial disputes, regulatory matters), and individuals (family law, immigration, employment disputes, personal injury, and more).",
    },
  ],
  clients: [
    {
      q: "How does the matching process work?",
      a: "The intake starts by asking who you are, a startup, small business, or individual, and which legal area you need help with. From there you answer a focused set of questions about your specific situation. LWYRD then matches you with vetted firms based on your practice area, matter specifics, timeline, budget, and firm preference.",
    },
    {
      q: "What is the intake questionnaire?",
      a: "A short guided wizard, typically five to ten minutes. No legal jargon. It begins with a few questions about your situation and legal category, then asks more specific questions based on your track and the category you selected. Your answers are stored securely and never shared without your knowledge.",
    },
    {
      q: "How are law firms vetted?",
      a: "Every firm on LWYRD passes the LWYRD Assessment before being listed. The assessment evaluates bar standing, disciplinary history, years of experience in the practice area, professional liability insurance, client reference verification, fee transparency, billing practices, responsiveness commitments, and more.",
    },
    {
      q: "What is the LWYRD Assessment?",
      a: "The LWYRD Assessment is a rigorous, multi-point vetting standard applied to every firm on the platform. It covers criteria like active bar status, no disciplinary history in the past five years, minimum five years of core practice experience, written engagement agreements, 48-hour response commitments, and transparent fee structures. Each firm's assessment result is visible on its profile, and assessment performance factors into match ranking.",
    },
    {
      q: "Are my answers confidential?",
      a: "Yes. Your intake answers are stored securely and used only to generate your matches. We do not share your information with law firms without your knowledge, and we do not sell your data.",
    },
    {
      q: "Can I be matched with more than one firm?",
      a: "Yes. Your results page shows multiple matched firms, ranked by fit. You can review all of them, save the ones that interest you, and compare before deciding who to contact.",
    },
  ],
  firms: [
    {
      q: "Looking to join the LWYRD network?",
      a: (
        <span>
          Visit our{" "}
          <Link href="/for-law-firms" className="text-[#002452] font-medium hover:underline">
            For Law Firms page →
          </Link>{" "}
          for the full picture, how the Assessment works, how matching operates, and how to apply.
        </span>
      ),
    },
    {
      q: "What does the LWYRD Assessment evaluate?",
      a: "The Assessment covers bar standing and disciplinary history, years of experience in core practice areas, professional liability insurance, verified client references, written engagement agreements, conflicts of interest procedures, a dedicated client point of contact, a 48-hour response commitment, upfront fee disclosure, itemized billing, and secure document handling.",
    },
    {
      q: "Is there a cost to be listed on LWYRD?",
      a: "No. There is no listing fee and no pay-to-appear model. Firms are listed based on their Assessment results.",
    },
    {
      q: "How do I apply?",
      a: (
        <Link href="/for-law-firms" className="text-[#002452] font-medium hover:underline">
          Apply on the For Law Firms page →
        </Link>
      ),
    },
  ],
};

const tabs: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "clients", label: "For Clients" },
  { id: "firms", label: "For Law Firms" },
];

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f4f0]">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <span className="inline-block bg-[#002452] text-white text-xs font-medium px-3 py-1.5 rounded-full tracking-wide mb-4">
            FAQ
          </span>
          <h1
            className="text-4xl sm:text-5xl text-[#002452] mb-4"
            style={{ ...lora, fontWeight: 500 }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-xl">
            Answers to common questions about how LWYRD works, for clients and for law firms.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.1 }}
          className="flex gap-2 flex-wrap mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-[#002452] text-white font-medium"
                  : "text-slate-500 hover:bg-[#002452]/8 hover:text-[#002452]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
        >
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {faqData[activeTab].map((faqItem, i) => (
                  <FaqAccordionItem
                    key={typeof faqItem.q === "string" ? faqItem.q : i}
                    question={faqItem.q}
                    answer={faqItem.a}
                    isLast={i === faqData[activeTab].length - 1}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            Don&apos;t see your question?{" "}
            <Link href="/contact" className="text-[#002452] font-medium hover:underline">
              Get in touch
            </Link>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
