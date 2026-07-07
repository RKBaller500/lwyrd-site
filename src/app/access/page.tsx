"use client";

import "@/styles/lwyrd-ds.css";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import Modal from "@/components/ui/Modal";
import { CheckCircle2, ArrowLeft, FileText, Layers3, ShieldCheck, LockKeyhole, CreditCard, X } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const included = [
  "Full firm identities and profiles for your matched firms",
  "A prepared summary of your matter, written from your answers",
  "A ready-to-send outreach message for each firm, yours to copy and send",
  "Guidance on what to ask and what to expect",
];

const tiers = [
  {
    name: "1 intake",
    label: "Single matter",
    description: "Best when you have one legal need and want to unlock the firms matched to that intake.",
    icon: FileText,
    priceLabel: "Pay once",
  },
  {
    name: "3-intake bundle",
    label: "Multiple needs",
    description: "For founders, operators, or families comparing counsel across a few separate legal issues.",
    icon: Layers3,
    featured: true,
    priceLabel: "Bundle",
  },
  {
    name: "5-intake bundle",
    label: "Ongoing matching",
    description: "For people or teams who expect recurring legal needs and want room to run several searches.",
    icon: ShieldCheck,
    priceLabel: "Bundle",
  },
];

function AccessContent() {
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number] | null>(null);

  const closeCheckout = () => setSelectedTier(null);

  return (
    <>
      <Modal
        isOpen={!!selectedTier}
        onClose={closeCheckout}
        maxWidth="max-w-lg"
        panelClassName="paywall-modal"
        closeIconClassName="text-[#6B6B70]"
      >
        {selectedTier && (
          <div>
            <div className="paywall-modal-head">
              <span className="icon-box">
                <CreditCard size={17} strokeWidth={1.7} />
              </span>
              <div>
                <p className="paywall-modal-eyebrow">Secure checkout</p>
                <h2>Unlock {selectedTier.name}</h2>
              </div>
            </div>
            <p className="paywall-modal-copy">
              This is a paid unlock. Once Stripe is connected, this button will take you to
              checkout for this option, then return you to your unlocked firms, profiles,
              prepared summary, and outreach messages.
            </p>
            <div className="paywall-modal-summary">
              <div>
                <span>Selected option</span>
                <strong>{selectedTier.name}</strong>
              </div>
              <div>
                <span>Billing</span>
                <strong>One-time payment</strong>
              </div>
            </div>
            <div className="paywall-modal-note">
              <LockKeyhole size={15} />
              <p>No subscription. No firm is contacted for you. You decide who to reach out to.</p>
            </div>
            <div className="paywall-modal-actions">
              <button className="btn btn-primary" type="button" disabled>
                Stripe checkout pending
              </button>
              <button className="btn btn-ghost" type="button" onClick={closeCheckout}>
                <X size={14} /> Not now
              </button>
            </div>
          </div>
        )}
      </Modal>
      <div className="lwyrd-ds ds-page">
        <MarketingNav />
        <main className="access-shell ds-main">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease }}>
            <Link href="/results" className="ds-breadcrumb access-back">
              <ArrowLeft size={14} /> Back to your matches
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
            className="access-hero"
          >
            <span className="marketing-eyebrow">Paywall</span>
            <h1>Unlock your matches</h1>
            <p>
              See who each firm is, open their full profiles, and get a prepared summary of
              your matter plus a ready-to-send message for each firm. You reach out on your
              own terms, we just make sure you walk in prepared. One-time, no subscription.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease, delay: 0.1 }}
            className="access-includes"
          >
            <p className="app-section-label">Every unlock includes</p>
            <div>
              {included.map((item, i) => (
                <div key={i}>
                  <CheckCircle2 size={15} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing tiers */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.14 }}
            className="access-tier-grid"
          >
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`access-tier ${tier.featured ? "is-featured" : ""}`}
                >
                  <div className="access-tier-icon">
                    <Icon size={19} strokeWidth={1.5} />
                  </div>
                  <p className="access-tier-label">
                    {tier.label}
                  </p>
                  <div className="access-tier-title">
                    <h2>{tier.name}</h2>
                    <span>{tier.priceLabel}</span>
                  </div>
                  <p className="access-tier-desc">
                    {tier.description}
                  </p>
                  <button
                    onClick={() => setSelectedTier(tier)}
                    className={tier.featured ? "btn access-tier-cta is-light" : "btn btn-primary access-tier-cta"}
                  >
                    Continue to checkout
                  </button>
                </div>
              );
            })}
          </motion.div>

          {/* Reassurance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.24 }}
            className="access-note"
          >
            <h2>Your intake is already complete</h2>
            <p>
              You&apos;ve already told us what we need to rank your matches. Unlocking reveals
              the identities and profiles behind those results, plus the prepared materials you
              can use when you decide to reach out.
            </p>
          </motion.div>
        </main>
        <MarketingFooter />
      </div>
    </>
  );
}

export default function AccessPage() {
  return (
    <AuthGuard>
      <AccessContent />
    </AuthGuard>
  );
}
