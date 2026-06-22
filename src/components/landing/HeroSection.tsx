"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle, Award, MapPin, Building2 } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const lora = { fontFamily: '"Lora", Georgia, serif' } as const;

const MOCK_FIRMS = [
  {
    name: "Hargrove & Ellis LLP",
    location: "New York, NY",
    size: "Large firm",
    score: 94,
    best: true,
    matched: ["Within your budget", "Serves fintech sector", "Series A focus"],
    missed: [],
  },
  {
    name: "Caldwell Partners",
    location: "New York, NY",
    size: "Boutique firm",
    score: 81,
    best: false,
    matched: ["Hourly billing matches", "NY licensed"],
    missed: ["Industry — doesn't serve your vertical"],
  },
];

function ProductMockup() {
  return (
    <div className="relative select-none" aria-hidden="true">
      <div className="absolute -inset-4 bg-[#002452]/6 blur-3xl rounded-3xl pointer-events-none" />

      <div className="relative bg-[#fbfaf6] rounded-2xl shadow-2xl border border-[#ddd7cc] overflow-hidden">
        {/* Top bar */}
        <div className="bg-[#f5f4f0] border-b border-[#ddd7cc] px-5 py-3.5 flex items-center justify-between">
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
              className={`rounded-xl p-4 border ${
                firm.best
                  ? "bg-[#002452]/[0.03] border-[#002452]/25 border-l-[3px] border-l-[#002452]"
                  : "bg-white border-[#ddd7cc]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0">
                  {firm.best && (
                    <span className="inline-flex items-center gap-1 bg-[#002452] text-white text-[10px] px-2 py-0.5 rounded-full font-medium mb-1.5">
                      <Award size={9} />
                      Best Match
                    </span>
                  )}
                  <p className="text-[#002452] text-sm font-medium leading-snug" style={lora}>
                    {firm.name}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
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
                <div className="text-right shrink-0">
                  <div className="text-2xl text-[#002452]" style={lora}>
                    {firm.score}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Match Score</div>
                  <div className="mt-1 h-1 w-14 bg-[#ddd7cc] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#002452] rounded-full"
                      style={{ width: `${firm.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-0.5">
                {firm.matched.map((m) => (
                  <div key={m} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                    {m}
                  </div>
                ))}
                {firm.missed.map((m) => (
                  <div key={m} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <XCircle size={10} className="text-rose-400 shrink-0" />
                    {m}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Third card — blurred / locked */}
          <div className="rounded-xl border border-[#ddd7cc] bg-white overflow-hidden relative">
            <div className="p-4 opacity-20">
              <p className="text-[#002452] text-sm font-medium" style={lora}>Merritt & Stone</p>
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
    <section className="relative bg-[#f5f4f0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-6xl text-[#002452] leading-tight mb-6"
              style={{ ...lora, fontWeight: 500 }}
            >
              Demystifying Specialized Legal Services
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.15 }}
              className="text-slate-500 text-lg leading-relaxed mb-8 max-w-lg"
            >
              LWYRD matches startups, SMBs, and individuals with vetted law firms through a guided intake — so you find the right legal help without the guesswork.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease, delay: 0.22 }}
            >
              <button
                onClick={handleGetMatched}
                className="inline-flex items-center gap-2 bg-[#002452] text-white px-8 py-4 rounded-2xl text-base font-medium hover:opacity-90 active:opacity-75 transition-opacity"
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
            transition={{ duration: 0.85, ease, delay: 0.28 }}
            className="hidden lg:block"
          >
            <ProductMockup />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
