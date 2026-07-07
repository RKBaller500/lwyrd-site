"use client";

import "@/styles/lwyrd-ds.css";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AuthGuard from "@/components/auth/AuthGuard";
import Modal from "@/components/ui/Modal";
import { CheckCircle2, ArrowLeft, FileText, Layers3, ShieldCheck, LockKeyhole, CreditCard, X, Eye } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const included = [
  "Firm identities and full profiles",
  "Prepared matter summary",
  "Ready-to-send outreach drafts",
  "Guidance for first conversations",
];

const tiers = [
  {
    id: "single",
    name: "1 intake",
    label: "Single matter",
    description: "Unlock one completed matter.",
    icon: FileText,
    price: "$25",
    priceNote: "$25 / unlock",
    badge: "Pay once",
  },
  {
    id: "bundle_3",
    name: "3-intake bundle",
    label: "Multiple needs",
    description: "For a few separate legal needs.",
    icon: Layers3,
    featured: true,
    price: "$60",
    priceNote: "$20 / unlock",
    badge: "Best value",
  },
  {
    id: "bundle_5",
    name: "5-intake bundle",
    label: "Ongoing matching",
    description: "For recurring searches over time.",
    icon: ShieldCheck,
    price: "$100",
    priceNote: "$20 / unlock",
    badge: "Bundle",
  },
];

type Tier = (typeof tiers)[number];

function AccessContent() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [creditsAvailable, setCreditsAvailable] = useState(0);
  const [currentIntakeUnlocked, setCurrentIntakeUnlocked] = useState(false);

  const closeCheckout = () => setSelectedTier(null);

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") return "/results";
    return new URLSearchParams(window.location.search).get("next") ?? "/results";
  }, []);

  const getActiveSubmissionId = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    const nextMatch = next?.match(/^\/results\/([^/?#]+)/);
    if (nextMatch?.[1]) return nextMatch[1];
    return window.sessionStorage.getItem("lwyrd_submission_id");
  };

  const getPreviewDestination = () => {
    const submissionId = getActiveSubmissionId();
    if (submissionId) return `/results/${submissionId}`;
    return nextPath.startsWith("/results") ? nextPath : "/results";
  };

  const loadPaywallState = async () => {
    const submissionId = getActiveSubmissionId();
    const query = new URLSearchParams();
    if (submissionId) query.set("submissionId", submissionId);
    const response = await fetch(`/api/paywall/status?${query.toString()}`, { credentials: "same-origin" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? "Unable to load paywall state.");
    return {
      creditsAvailable: typeof body.creditsAvailable === "number" ? body.creditsAvailable : 0,
      currentIntakeUnlocked: !!body.currentIntakeUnlocked,
    };
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const state = await loadPaywallState();
        if (cancelled) return;
        setCreditsAvailable(state.creditsAvailable);
        setCurrentIntakeUnlocked(state.currentIntakeUnlocked);
      } catch {
        if (cancelled) return;
        setCreditsAvailable(0);
        setCurrentIntakeUnlocked(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStripeCheckout = async (tier: Tier) => {
    setPreviewLoading(true);
    setPreviewError("");
    const submissionId = getActiveSubmissionId();
    try {
      const response = await fetch("/api/paywall/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, next: nextPath, tierId: tier.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || typeof body.url !== "string") {
        throw new Error(body.error ?? "Unable to start checkout.");
      }
      window.location.href = body.url;
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to start checkout.");
      setPreviewLoading(false);
    }
  };

  const handlePreviewUnlock = async (options?: { tier?: Tier; mode?: "purchase" | "credit" }) => {
    setPreviewLoading(true);
    setPreviewError("");
    const submissionId = getActiveSubmissionId();
    try {
      const response = await fetch("/api/paywall/preview-unlock", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          next: nextPath,
          tierId: options?.tier?.id ?? "single",
          mode: options?.mode ?? "purchase",
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? "Unable to enable preview unlock.");
      }
      setCreditsAvailable(typeof body.creditsAvailable === "number" ? body.creditsAvailable : 0);
      setCurrentIntakeUnlocked(!!body.currentIntakeUnlocked);
      router.push(typeof body.destination === "string" ? body.destination : getPreviewDestination());
      router.refresh();
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to enable preview unlock.");
      setPreviewLoading(false);
    }
  };

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
                <span>Price</span>
                <strong>{selectedTier.price}</strong>
              </div>
            </div>
            <div className="paywall-modal-note">
              <LockKeyhole size={15} />
              <p>No subscription. No firm is contacted for you. You decide who to reach out to.</p>
            </div>
            <div className="paywall-modal-actions">
              <button className="btn btn-primary" type="button" onClick={() => handleStripeCheckout(selectedTier)} disabled={previewLoading}>
                <CreditCard size={14} /> {previewLoading ? "Redirecting..." : `Pay ${selectedTier.price}`}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => handlePreviewUnlock({ tier: selectedTier, mode: "purchase" })} disabled={previewLoading}>
                <Eye size={14} /> {previewLoading ? "Unlocking..." : `Preview ${selectedTier.name}`}
              </button>
              <button className="btn btn-ghost" type="button" onClick={closeCheckout}>
                <X size={14} /> Not now
              </button>
            </div>
            {previewError && <p className="paywall-modal-error">{previewError}</p>}
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

          {(creditsAvailable > 0 || currentIntakeUnlocked) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.08 }}
              className="access-credit-panel"
            >
              <div>
                <span className="app-section-label">Your account</span>
                <p>
                  {currentIntakeUnlocked
                    ? "This intake is already unlocked for your account."
                    : `${creditsAvailable} ${creditsAvailable === 1 ? "unlock credit" : "unlock credits"} available.`}
                </p>
              </div>
              {!currentIntakeUnlocked && creditsAvailable > 0 && (
                <button className="btn btn-primary" type="button" onClick={() => handlePreviewUnlock({ mode: "credit" })} disabled={previewLoading}>
                  {previewLoading ? "Applying..." : "Use 1 unlock credit"}
                </button>
              )}
            </motion.div>
          )}

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
              See firm identities, open full profiles, and get your prepared summary plus
              outreach drafts. You reach out on your own terms. One-time, no subscription.
            </p>
          </motion.div>

          {/* Pricing tiers */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.1 }}
            className="access-tier-grid"
          >
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`access-tier ${tier.featured ? "is-featured" : ""}`}
                >
                  <div className="access-tier-top">
                    <div className="access-tier-icon">
                      <Icon size={19} strokeWidth={1.5} />
                    </div>
                    <span>{tier.badge}</span>
                  </div>
                  <p className="access-tier-label">
                    {tier.label}
                  </p>
                  <div className="access-tier-title">
                    <h2>{tier.name}</h2>
                  </div>
                  <div className="access-tier-price">
                    <strong>{tier.price}</strong>
                    <span>{tier.priceNote}</span>
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

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease, delay: 0.14 }}
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
            <button className="access-preview-link" type="button" onClick={() => handlePreviewUnlock({ tier: tiers[0], mode: "purchase" })} disabled={previewLoading}>
              <Eye size={15} /> {previewLoading ? "Opening preview..." : "Temporary preview 1-intake purchase"}
            </button>
            {previewError && <p className="access-preview-error">{previewError}</p>}
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
