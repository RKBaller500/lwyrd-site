"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import type { Firm, FirmContactType, FirmProfileMatchContext } from "@/types";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clipboard,
  Copy,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import SaveFirmButton from "./SaveFirmButton";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;
const pricingLanguage = /\b(budget|billing|fee|fees|cost|costs|price|pricing|retainer|hourly|flat[- ]?fee|\$)\b/i;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique",
  "mid-size": "Mid-size",
  large: "Large",
};

const responseLabels: Record<string, string> = {
  "same-day": "Often same day, not a guarantee.",
  "24h": "Typically within 24 hours, not a guarantee.",
  "48h": "Typically within 48 hours, not a guarantee.",
  "72h": "Typically within 72 hours, not a guarantee.",
};

type ModalId = "summary" | "email" | "contact" | null;

interface FirmProfileProps {
  firm: Firm;
  initialSaved?: boolean;
  matchContext?: FirmProfileMatchContext | null;
}

function fallbackContactType(id: string): FirmContactType {
  const bucket = id.length % 3;
  if (bucket === 0) return "form";
  if (bucket === 1) return "email";
  return "phone";
}

function contactForFirm(firm: Firm) {
  const type = firm.contactType ?? fallbackContactType(firm.id);
  return {
    type,
    url: firm.contactUrl ?? `https://www.google.com/search?q=${encodeURIComponent(`${firm.name} contact`)}`,
    email: firm.contactEmail ?? `intake@${firm.id.replace(/[^a-z0-9-]/g, "")}.example`,
    phone: firm.contactPhone ?? "(212) 555-0198",
  };
}

function formatPractice(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatList(items: string[], limit = 3) {
  return items.slice(0, limit).map(formatPractice).join(", ");
}

function yearsInPractice(founded: number): number | null {
  if (!founded) return null;
  return Math.max(1, new Date().getFullYear() - founded);
}

function buildFallbackReasons(firm: Firm): string[] {
  return [
    ...firm.strengths.slice(0, 3),
    `${sizeLabels[firm.size] ?? firm.size} firm with ${formatList(firm.practiceAreas, 2)} coverage.`,
  ].filter(Boolean);
}

function visibleText(items: string[]) {
  return items.filter((item) => item && !pricingLanguage.test(item));
}

function sentenceFromAnswer(question: string, answer: string) {
  const cleanQuestion = question.replace(/\?$/, "").toLowerCase();
  return `You answered "${answer}" for ${cleanQuestion}.`;
}

function buildFitCards(firm: Firm, matchContext?: FirmProfileMatchContext | null) {
  const answers = matchContext?.prepared.answeredItems ?? [];
  const reasons = visibleText(matchContext?.reasons?.length ? matchContext.reasons : buildFallbackReasons(firm));
  const fallback = [
    "This aligns with the matter category and jurisdiction stored in your match.",
    `This firm concentrates on ${formatList(firm.practiceAreas, 2) || "the relevant practice areas"}.`,
    `You are viewing a ${sizeLabels[firm.size] ?? firm.size} firm profile from your matched shortlist.`,
    firm.industries.length ? `The firm's researched industry focus includes ${formatList(firm.industries, 2)}.` : "This firm has profile signals that align with your matter.",
  ];

  return (reasons.length ? reasons : fallback).slice(0, 4).map((reason, index) => {
    const answer = answers[index % Math.max(answers.length, 1)];
    return {
      statement: reason.replace(/\.$/, "."),
      detail: answer ? sentenceFromAnswer(answer.question, String(answer.answer)) : fallback[index] ?? fallback[0],
    };
  });
}

function composeAboutFirm(firm: Firm) {
  const size = sizeLabels[firm.size]?.toLowerCase() ?? firm.size;
  const attorneys = firm.team.length ? ` with ${firm.team.length} attorney profiles in our records` : "";
  const practices = formatList(firm.practiceAreas, 4).toLowerCase();
  const industries = formatList(firm.industries, 4).toLowerCase();
  const recognition = visibleText(firm.strengths).find((strength) => /chambers|ranked|listed|pitchbook|recognized|award/i.test(strength));

  const sentences = [
    `${firm.name} is a ${size} firm headquartered in ${firm.location}${attorneys}, focused on ${practices || "the practice areas shown here"}.`,
    industries
      ? `They serve clients across ${industries}, with profile signals tied to ${formatList(firm.practiceAreas, 2).toLowerCase()}.`
      : `Their researched profile emphasizes ${formatList(firm.practiceAreas, 2).toLowerCase()} and related client needs.`,
    recognition ? `${recognition.replace(/\.$/, "")}.` : "",
  ].filter(Boolean);

  return sentences.join(" ");
}

function mailtoHref(firm: Firm, message: string) {
  const contact = contactForFirm(firm);
  const subject = `Inquiry about ${firm.name} via LWYRD`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export default function FirmProfile({ firm, initialSaved, matchContext }: FirmProfileProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [outreachDraft, setOutreachDraft] = useState(matchContext?.prepared.outreachMessage ?? "");
  const contact = useMemo(() => contactForFirm(firm), [firm]);
  const ph = usePostHog();
  const score = matchContext?.score ?? firm.overallScore;
  const years = yearsInPractice(firm.founded);
  const fitCards = useMemo(() => buildFitCards(firm, matchContext), [firm, matchContext]);
  const strengths = visibleText(firm.strengths);
  const prepared = matchContext?.prepared;
  const summaryText = prepared?.summary ?? "Open this profile from one of your matches to generate a prepared matter summary from your intake answers.";
  const outreachText = outreachDraft || "Open this profile from one of your matches to generate a ready-to-send outreach message.";

  useEffect(() => {
    ph?.capture("firm_viewed", {
      firm_id: firm.id,
      firm_name: firm.name,
      match_score: score,
      intake_id: matchContext?.intakeId,
    });
  }, [firm.id, firm.name, matchContext?.intakeId, ph, score]);

  useEffect(() => {
    document.body.style.overflow = activeModal ? "hidden" : "";
    if (!activeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModal(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const handleFormContact = async () => {
    await copyText(outreachText, "form");
    window.open(contact.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="ds-shell">
      <div className="firm-profile-grid">
        <main className="firm-profile-main">
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="ds-breadcrumb firm-breadcrumb"
          >
            <Link href={matchContext ? `/results/${matchContext.intakeId}` : "/results"}>Your matches</Link>
            <span className="sep">/</span>
            <span>{firm.name}</span>
          </motion.nav>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="firm-profile-hero"
          >
            <div
              className={`firm-logo ${firm.logoUrl ? "has-logo" : ""}`}
              role="img"
              aria-label={`${firm.name} logo`}
              style={firm.logoUrl ? { backgroundImage: `url(${firm.logoUrl})` } : undefined}
            >
              {!firm.logoUrl && <span>{firm.name[0]}</span>}
            </div>
            <div className="firm-hero-copy">
              <div className="firm-badges">
                {firm.verified && (
                  <span
                    className="match-badge firm-verified"
                    title="We verified this firm's bar standing and practice focus through public bar directories, firm records, and published filings."
                  >
                    <ShieldCheck size={11} /> LWYRD Verified <Info size={10} />
                  </span>
                )}
                <span className="match-badge">{sizeLabels[firm.size] ?? firm.size}</span>
              </div>
              <h1 style={serif}>{firm.name}</h1>
              <p>{firm.tagline}</p>
              <div className="firm-profile-meta">
                <span><MapPin size={14} />{firm.location}</span>
                {firm.founded && <span><Calendar size={14} />Founded {firm.founded}</span>}
                <span><Building2 size={14} />{sizeLabels[firm.size] ?? firm.size}</span>
                {years && <span><Users size={14} />{years}+ years in practice</span>}
              </div>
            </div>
            <div className="firm-fit-score">
              <strong style={serif}>{score}</strong>
              <span>match score</span>
            </div>
          </motion.section>

          <Section title="Why this firm fits you">
            <div className="firm-reason-list">
              {fitCards.map((card, index) => (
                <div key={`${card.statement}-${index}`} className="firm-reason">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>{card.statement}</strong>
                    <p>{card.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="About the firm">
            <p className="firm-body-copy">{composeAboutFirm(firm)}</p>
          </Section>

          <Section title="Key strengths">
            <div className="firm-strength-list">
              {(strengths.length ? strengths : [`Deep expertise in ${formatList(firm.practiceAreas, 2) || "the relevant practice areas"}`]).map((strength, index) => (
                <div key={`${strength}-${index}`} className="firm-strength">
                  <Star size={15} />
                  <span>{strength.replace(/\.$/, "")}</span>
                </div>
              ))}
            </div>
          </Section>
        </main>

        <aside className="firm-profile-side">
          <div className="ds-card firm-reach-card">
            <span className="marketing-eyebrow">Next step</span>
            <h2>Reach out to {firm.name}</h2>
            <p>We&apos;ve prepared everything you need. We haven&apos;t contacted the firm for you, you reach out when you&apos;re ready.</p>
            <div className="firm-action-stack">
              <button className="btn btn-ghost" type="button" onClick={() => setActiveModal("summary")}>
                <Clipboard size={15} /> View matter summary
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setActiveModal("email")}>
                <Mail size={15} /> View outreach email
              </button>
              <button className="btn btn-primary" type="button" onClick={() => setActiveModal("contact")}>
                <ExternalLink size={15} /> Contact this firm
              </button>
            </div>
          </div>

          <div className="firm-save-row">
            <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} />
          </div>

          <ReferenceCard title="Firm details">
            <DetailRow label="Response time" value={responseLabels[firm.responseTime] ?? "Typically within a few business days, not a guarantee."} />
            <DetailRow label="Firm type" value={sizeLabels[firm.size] ?? firm.size} />
            <DetailRow label="Location" value={firm.location} />
            {firm.founded && <DetailRow label="Founded" value={String(firm.founded)} />}
          </ReferenceCard>

          <ReferenceCard title="Practice areas">
            <ChipList items={firm.practiceAreas} linkPrefix="/services" />
          </ReferenceCard>

          <ReferenceCard title="Industries served">
            <ChipList items={firm.industries} />
          </ReferenceCard>
        </aside>
      </div>

      {activeModal === "summary" && (
        <ProfileModal title="Your matter summary" onClose={() => setActiveModal(null)}>
          <Notice>This is the summary we prepared from your answers. It has not been sent anywhere.</Notice>
          <ReadableBlock text={summaryText} />
          {prepared?.answeredItems?.length ? (
            <div className="firm-answer-list">
              {prepared.answeredItems.slice(0, 6).map((item, index) => (
                <div key={`${item.question}-${index}`}>
                  <strong>{item.question}</strong>
                  <span>{String(item.answer)}</span>
                </div>
              ))}
            </div>
          ) : null}
          <ModalActions>
            <button className="btn btn-primary" type="button" onClick={() => copyText(summaryText, "summary")}>
              <Copy size={15} /> {copied === "summary" ? "Copied" : "Copy"}
            </button>
          </ModalActions>
        </ProfileModal>
      )}

      {activeModal === "email" && (
        <ProfileModal title="Your outreach message" onClose={() => setActiveModal(null)}>
          <Notice>A ready-to-send draft. You choose whether and when to send it.</Notice>
          <textarea
            className="firm-editable-draft"
            value={outreachText}
            onChange={(event) => setOutreachDraft(event.target.value)}
            aria-label="Your outreach message"
          />
          <ModalActions>
            <button className="btn btn-primary" type="button" onClick={() => copyText(outreachText, "message")}>
              <Copy size={15} /> {copied === "message" ? "Copied" : "Copy"}
            </button>
          </ModalActions>
        </ProfileModal>
      )}

      {activeModal === "contact" && (
        <ProfileModal title={`Contact ${firm.name}`} onClose={() => setActiveModal(null)}>
          <Notice>You&apos;re reaching out directly. We haven&apos;t contacted them for you.</Notice>
          <ContactModalBody
            firm={firm}
            contactType={contact.type}
            summary={summaryText}
            message={outreachText}
            copied={copied}
            onCopy={copyText}
            onFormContact={handleFormContact}
          />
        </ProfileModal>
      )}

      <style>{`
        .firm-profile-grid{display:grid;grid-template-columns:1fr;gap:22px;align-items:start}
        .firm-profile-main{display:grid;gap:16px}
        .firm-profile-side{display:grid;gap:12px;align-content:start}
        .firm-breadcrumb{margin-bottom:2px}
        .firm-profile-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:18px;align-items:start;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:var(--shadow-sm);padding:clamp(18px,2.8vw,26px)}
        .firm-logo{width:58px;height:58px;border:1px solid var(--navy-tint-2);border-radius:14px;background:var(--navy-tint);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
        .firm-logo.has-logo{background-color:#fff;background-position:center;background-repeat:no-repeat;background-size:contain}
        .firm-logo span{font-family:var(--display);font-size:1.6rem;color:var(--navy)}
        .firm-badges{display:flex;flex-wrap:wrap;gap:7px}
        .firm-verified{position:relative}
        .firm-profile-hero h1{font-size:clamp(1.75rem,3vw,2.45rem);line-height:1.08;margin:9px 0 7px;max-width:20ch;letter-spacing:0}
        .firm-profile-hero p{color:var(--muted);max-width:72ch;line-height:1.45;font-size:.92rem}
        .firm-profile-meta{display:flex;flex-wrap:wrap;gap:8px 14px;color:var(--muted);font-size:.8rem;margin-top:14px}
        .firm-profile-meta span{display:inline-flex;align-items:center;gap:6px}
        .firm-fit-score{border:1px solid var(--navy-tint-2);border-radius:14px;background:var(--navy-tint);padding:12px 14px;text-align:center;min-width:88px}
        .firm-fit-score strong{display:block;color:var(--navy);font-size:1.9rem;line-height:1}
        .firm-fit-score span{display:block;color:var(--muted);font-size:.6rem;font-weight:700;letter-spacing:.11em;text-transform:uppercase;margin-top:5px}
        .firm-section{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:var(--shadow-sm);padding:clamp(16px,2.4vw,22px)}
        .firm-section h2,.firm-reach-card h2{font-size:clamp(1.15rem,2vw,1.45rem);line-height:1.18;margin:0 0 12px;letter-spacing:0}
        .firm-body-copy{color:var(--ink-2);font-size:.9rem;line-height:1.62}
        .firm-reason-list{display:grid;grid-template-columns:1fr;gap:10px}
        .firm-reason{display:flex;gap:11px;border:1px solid var(--line);border-radius:12px;background:var(--paper-alt);padding:12px}
        .firm-reason svg{color:#057a55;flex:0 0 auto;margin-top:2px}
        .firm-reason strong{display:block;color:var(--ink);font-size:.88rem;margin-bottom:4px;line-height:1.3}
        .firm-reason p{color:var(--muted);font-size:.79rem;line-height:1.45}
        .firm-strength-list{display:grid;gap:9px}
        .firm-strength{display:flex;align-items:flex-start;gap:9px;color:var(--ink-2);font-size:.87rem;line-height:1.45}
        .firm-strength svg{color:var(--navy);fill:var(--navy-tint);flex:0 0 auto;margin-top:2px}
        .firm-reach-card{padding:18px;border-radius:16px;box-shadow:var(--shadow-sm)}
        .firm-reach-card p{color:var(--muted);font-size:.83rem;line-height:1.52;margin-bottom:14px}
        .firm-action-stack{display:grid;gap:9px}
        .firm-action-stack .btn{justify-content:center;width:100%;min-height:42px}
        .firm-save-row button{width:100%;justify-content:center;padding:10px 16px}
        .firm-side-card{padding:16px;border-radius:16px;box-shadow:var(--shadow-sm)}
        .firm-side-card h3{font-family:var(--body);font-size:.92rem;line-height:1.25;margin:0 0 12px;color:var(--ink);font-weight:700;letter-spacing:0}
        .firm-detail-list{display:grid;gap:10px}
        .firm-detail{display:grid;gap:2px;border-bottom:1px solid var(--line);padding-bottom:9px}
        .firm-detail:last-child{border-bottom:0;padding-bottom:0}
        .firm-detail span{color:var(--muted);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .firm-detail strong{color:var(--ink-2);font-size:.84rem;line-height:1.38;font-weight:600}
        .firm-chip-panel{display:flex;flex-wrap:wrap;gap:7px}
        .firm-chip{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;background:var(--paper-alt);color:var(--ink-2);font-size:.76rem;line-height:1;padding:8px 10px;transition:background .15s ease,border-color .15s ease,color .15s ease}
        a.firm-chip:hover{background:var(--navy-tint);border-color:var(--navy-tint-2);color:var(--navy)}
        .firm-modal-backdrop{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(5,16,28,.46);backdrop-filter:blur(4px);padding:20px}
        .firm-modal{width:min(640px,100%);max-height:min(760px,calc(100vh - 40px));overflow:auto;border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:var(--shadow-md)}
        .firm-modal-head{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid var(--line);padding:18px 20px}
        .firm-modal-head h2{font-size:clamp(1.15rem,2vw,1.45rem);line-height:1.2;margin:0;letter-spacing:0}
        .firm-modal-close{width:34px;height:34px;border:1px solid var(--line);border-radius:999px;color:var(--ink-2);display:inline-flex;align-items:center;justify-content:center;transition:background .15s ease,border-color .15s ease}
        .firm-modal-close:hover{background:var(--paper-alt);border-color:var(--navy-tint-2)}
        .firm-modal-body{display:grid;gap:14px;padding:18px 20px 20px}
        .firm-notice{border:1px solid var(--navy-tint-2);border-radius:12px;background:var(--navy-tint);color:var(--ink-2);font-size:.82rem;line-height:1.45;padding:10px 12px}
        .firm-readable-block{white-space:pre-wrap;border:1px solid var(--line);border-radius:14px;background:var(--paper-alt);color:var(--ink-2);font-family:var(--body);font-size:.84rem;line-height:1.55;padding:14px;margin:0}
        .firm-editable-draft{display:block;width:100%;min-height:240px;border:1px solid var(--line);border-radius:14px;resize:vertical;color:var(--ink-2);background:var(--paper-alt);font-family:var(--body);font-size:.84rem;line-height:1.55;padding:14px;outline:none}
        .firm-editable-draft:focus{border-color:var(--navy-tint-2);box-shadow:0 0 0 3px rgba(0,43,85,.08)}
        .firm-answer-list{display:grid;gap:8px}
        .firm-answer-list div{display:grid;gap:3px;border:1px solid var(--line);border-radius:12px;padding:10px 12px}
        .firm-answer-list strong{font-size:.78rem;color:var(--ink)}
        .firm-answer-list span{font-size:.8rem;color:var(--muted)}
        .firm-modal-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:9px}
        .firm-contact-panel{display:grid;gap:12px}
        .firm-contact-panel p{color:var(--muted);font-size:.84rem;line-height:1.5;margin:0}
        .firm-phone-box{display:grid;gap:8px;border:1px solid var(--line);border-radius:14px;background:var(--paper-alt);padding:14px}
        .firm-phone-box span{color:var(--muted);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
        .firm-phone-box strong{display:flex;align-items:center;gap:8px;font-size:1.25rem;color:var(--navy)}
        @media(min-width:980px){
          .firm-profile-grid{grid-template-columns:minmax(0,1.9fr) minmax(300px,.95fr)}
          .firm-profile-side{position:sticky;top:96px;align-self:start}
        }
        @media(max-width:760px){
          .firm-profile-hero{grid-template-columns:1fr}
          .firm-fit-score{justify-self:start}
          .firm-modal-backdrop{align-items:flex-end;padding:12px}
          .firm-modal{max-height:calc(100vh - 24px);border-radius:16px}
          .firm-modal-actions .btn{width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="firm-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ReferenceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ds-card firm-side-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="firm-detail-list">
      <div className="firm-detail">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ChipList({ items, linkPrefix }: { items: string[]; linkPrefix?: string }) {
  return (
    <div className="firm-chip-panel">
      {items.map((item) => {
        const label = formatPractice(item);
        if (linkPrefix) {
          return (
            <Link key={item} href={`${linkPrefix}/${item}`} className="firm-chip">
              {label}
            </Link>
          );
        }
        return <span key={item} className="firm-chip">{label}</span>;
      })}
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="firm-notice">{children}</p>;
}

function ReadableBlock({ text }: { text: string }) {
  return <pre className="firm-readable-block">{text}</pre>;
}

function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="firm-modal-actions">{children}</div>;
}

function ProfileModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="firm-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="firm-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="firm-modal-head">
          <h2>{title}</h2>
          <button className="firm-modal-close" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="firm-modal-body">{children}</div>
      </section>
    </div>
  );
}

function ContactModalBody({
  firm,
  contactType,
  summary,
  message,
  copied,
  onCopy,
  onFormContact,
}: {
  firm: Firm;
  contactType: FirmContactType;
  summary: string;
  message: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
  onFormContact: () => void;
}) {
  const contact = contactForFirm(firm);

  if (contactType === "form") {
    return (
      <div className="firm-contact-panel">
        <p>Copy your prepared message, then open the firm&apos;s contact form in a new tab.</p>
        <button className="btn btn-primary" type="button" onClick={onFormContact}>
          <ExternalLink size={15} /> {copied === "form" ? "Message copied" : "Copy message and open their form"}
        </button>
        <p>Paste your message into their form when you reach out.</p>
        <button className="btn btn-ghost" type="button" onClick={() => onCopy(message, "contact-copy")}>
          <Copy size={15} /> {copied === "contact-copy" ? "Copied" : "Copy message"}
        </button>
      </div>
    );
  }

  if (contactType === "email") {
    return (
      <div className="firm-contact-panel">
        <p>This opens your email client with the subject and message pre-filled. Review it before sending.</p>
        <a className="btn btn-primary" href={mailtoHref(firm, message)}>
          <Mail size={15} /> Open a pre-filled email
        </a>
        <button className="btn btn-ghost" type="button" onClick={() => onCopy(message, "contact-copy")}>
          <Copy size={15} /> {copied === "contact-copy" ? "Copied" : "Copy message"}
        </button>
      </div>
    );
  }

  return (
    <div className="firm-contact-panel">
      <div className="firm-phone-box">
        <span>Phone</span>
        <strong><Phone size={16} /> {contact.phone}</strong>
      </div>
      <p>Keep your summary handy for the call.</p>
      <button className="btn btn-primary" type="button" onClick={() => onCopy(summary, "summary")}>
        <Clipboard size={15} /> {copied === "summary" ? "Copied" : "Copy summary"}
      </button>
      <button className="btn btn-ghost" type="button" onClick={() => onCopy(message, "contact-copy")}>
        <Copy size={15} /> {copied === "contact-copy" ? "Copied" : "Copy message"}
      </button>
    </div>
  );
}
