"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Award, MapPin, Building2 } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const MOCK_FIRMS = [
  {
    name: "Sterling & Associates",
    location: "New York, NY",
    size: "Boutique firm",
    score: 94,
    best: true,
    matched: ["Matches your budget range", "Specializes in your practice area", "Works with early-stage startups"],
    missed: [],
  },
  {
    name: "Whitmore Legal Group",
    location: "San Francisco, CA",
    size: "Mid-size firm",
    score: 78,
    best: false,
    matched: ["Hourly billing available", "Strong litigation track record"],
    missed: ["Outside your preferred location"],
  },
];

function ScoreRing({ score }: { score: number }) {
  const size = 58;
  const radius = 22;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ddd7cc" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="#002452" strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[#002452] text-[14px] leading-none" style={{ ...lora, fontWeight: 500 }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase">Match</span>
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="relative select-none" aria-hidden="true">
      <div className="absolute -inset-6 bg-[#002452]/10 blur-3xl rounded-3xl pointer-events-none" />

      <div className="relative bg-[#fbfaf6] rounded-2xl shadow-2xl border border-[#ddd7cc] overflow-hidden">
        {/* Top bar */}
        <div className="bg-[#f5f4f0] border-b border-[#ddd7cc] px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-[#002452]" style={{ ...lora, fontWeight: 500 }}>
            Your Matches
          </span>
          <span className="text-xs text-slate-400">3 firms matched</span>
        </div>

        {/* Cards */}
        <div className="p-4 space-y-3">
          {MOCK_FIRMS.map((firm) => (
            <div
              key={firm.name}
              className={`rounded-xl overflow-hidden border-2 ${
                firm.best
                  ? "border-[#002452] shadow-[0_2px_14px_rgba(0,36,82,0.12)]"
                  : "border-[#002452]/25"
              }`}
            >
              {firm.best && <div className="h-[3px] bg-[#002452]" />}
              <div className="bg-[#fbfaf6] p-4">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    {firm.best && (
                      <span className="inline-flex items-center gap-1 bg-[#002452] text-white text-[9px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase mb-1.5">
                        <Award size={8} strokeWidth={2.5} />
                        Best Match
                      </span>
                    )}
                    {!firm.best && (
                      <span className="text-[9px] text-slate-400 font-medium mb-1.5 block">#2</span>
                    )}
                    <p className="text-[#002452] text-sm leading-snug" style={{ ...lora, fontWeight: 500 }}>
                      {firm.name}
                    </p>
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={9} />
                        {firm.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Building2 size={9} />
                        {firm.size}
                      </span>
                    </div>
                  </div>
                  <ScoreRing score={firm.score} />
                </div>

                <div className="space-y-0.5">
                  {firm.matched.map((m) => (
                    <div key={m} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                      {m}
                    </div>
                  ))}
                  {firm.missed.map((m) => (
                    <div key={m} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <XCircle size={10} className="text-rose-400/80 shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Third card, blurred / locked */}
          <div className="rounded-xl border-2 border-[#002452]/30 bg-[#fbfaf6] overflow-hidden relative">
            <div className="p-4 opacity-20">
              <p className="text-[#002452] text-sm" style={{ ...lora, fontWeight: 500 }}>Merritt & Stone</p>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 bg-[#ddd7cc] rounded w-3/4" />
                <div className="h-2 bg-[#ddd7cc] rounded w-1/2" />
              </div>
            </div>
            <div className="absolute inset-0 backdrop-blur-[3px] bg-[#fbfaf6]/60 flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-medium px-2.5 py-1 bg-white rounded-full border border-[#ddd7cc]">
                + 1 more result
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetMatched = () => {
    router.push(isAuthenticated ? "/intake/start" : "/get-matched");
  };

  return (
    <section className="relative bg-[#0A0F1C] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="text-xs font-medium tracking-widest uppercase text-[#8A93A6] mb-5"
            >
              Legal matchmaking, built differently
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.04] mb-6"
              style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 700 }}
            >
              <span className="text-[#E6EAF2]">Demystifying </span>
              <span style={{ color: "#C9962B" }}>Specialized</span>
              <span className="text-[#E6EAF2]"> Legal Services.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.18 }}
              className="text-[#8A93A6] text-base leading-relaxed mb-9 max-w-lg"
            >
              LWYRD connects startups, SMBs, and individuals with a curated network of vetted law firms, so you find exactly the right advocate before you spend a dollar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.25 }}
            >
              <button
                onClick={handleGetMatched}
                className="inline-flex items-center gap-2 bg-white hover:bg-[#E6EAF2] active:bg-[#C8CDD8] text-[#0A0F1C] px-7 py-3.5 rounded-full text-base font-medium transition-colors"
              >
                Get Matched
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>

          {/* Right: product mockup */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease, delay: 0.3 }}
            className="hidden lg:block"
          >
            <ProductMockup />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
