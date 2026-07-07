"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import type { Firm, FirmContactType, FirmProfileMatchContext } from "@/types";
import {
  Building2,
  CheckCircle2,
  Clipboard,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import SaveFirmButton from "./SaveFirmButton";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const serif = { fontFamily: '"Libre Baskerville", Georgia, serif' } as const;

const sizeLabels: Record<string, string> = {
  boutique: "Boutique firm",
  "mid-size": "Mid-size firm",
  large: "Large firm",
};

const responseLabels: Record<string, string> = {
  "same-day": "Same-day response signal",
  "24h": "Typically within 24 hours",
  "48h": "Typically within 48 hours",
  "72h": "Typically within 72 hours",
};

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

function yearsInPractice(founded: number): number | null {
  if (!founded) return null;
  return Math.max(1, new Date().getFullYear() - founded);
}

function buildFallbackReasons(firm: Firm): string[] {
  return [
    ...firm.strengths.slice(0, 3),
    `${sizeLabels[firm.size] ?? firm.size} with ${firm.practiceAreas.slice(0, 2).map(formatPractice).join(" and ")} coverage.`,
  ].filter(Boolean);
}

function mailtoHref(firm: Firm, message: string) {
  const contact = contactForFirm(firm);
  const subject = `Inquiry about ${firm.name} via LWYRD`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

export default function FirmProfile({ firm, initialSaved, matchContext }: FirmProfileProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [outreachDraft, setOutreachDraft] = useState(matchContext?.prepared.outreachMessage ?? "");
  const contact = useMemo(() => contactForFirm(firm), [firm]);
  const ph = usePostHog();
  const score = matchContext?.score ?? firm.overallScore;
  const years = yearsInPractice(firm.founded);
  const matchReasons = matchContext?.reasons?.length ? matchContext.reasons : buildFallbackReasons(firm);
  const prepared = matchContext?.prepared;

  useEffect(() => {
    ph?.capture("firm_viewed", {
      firm_id: firm.id,
      firm_name: firm.name,
      match_score: score,
      intake_id: matchContext?.intakeId,
    });
  }, [firm.id, firm.name, matchContext?.intakeId, ph, score]);

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
    if (outreachDraft) {
      await copyText(outreachDraft, "form");
    }
    window.open(contact.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="ds-shell">
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="ds-breadcrumb"
        style={{ marginBottom: "1.5rem" }}
      >
        <Link href={matchContext ? `/results/${matchContext.intakeId}` : "/results"}>Your matches</Link>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink-2)" }}>{firm.name}</span>
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
        <div>
          <div className="locked-badges">
            {firm.verified && (
              <span className="match-badge">
                <ShieldCheck size={10} /> Bar standing verified
              </span>
            )}
            <span className="match-badge">{sizeLabels[firm.size] ?? firm.size}</span>
          </div>
          <h1>{firm.name}</h1>
          <p>{firm.tagline}</p>
          <div className="firm-profile-meta">
            <span><MapPin size={14} />{firm.location}</span>
            <span><Building2 size={14} />{firm.practiceAreas.slice(0, 2).map(formatPractice).join(", ")}</span>
            {years && <span><Users size={14} />{years}+ years in practice</span>}
          </div>
        </div>
        <div className="firm-fit-score">
          <strong style={serif}>{score}</strong>
          <span>{matchContext ? "fit score" : "LWYRD score"}</span>
        </div>
      </motion.section>

      <div className="firm-profile-grid">
        <main className="firm-profile-main">
          <Section eyebrow="Why this firm fits you" title={matchContext ? `Matched for ${matchContext.categoryName}` : "Why this firm is relevant"}>
            <div className="firm-reason-list">
              {matchReasons.map((reason, index) => (
                <div key={`${reason}-${index}`} className="firm-reason">
                  <CheckCircle2 size={17} />
                  <div>
                    <strong>{reason}</strong>
                    <p>
                      {matchContext
                        ? "This comes from the intake answers you provided and the firm's stored profile signals."
                        : "This comes from the firm's stored profile and LWYRD assessment signals."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <section className="firm-go-forward">
            <div className="firm-go-forward-head">
              <span className="marketing-eyebrow">Go forward</span>
              <h2>Prepared summary and outreach draft</h2>
              <p>
                LWYRD prepares the summary and outreach draft. You decide whether to send it,
                who to contact, and what to ask. We have not contacted the firm for you.
              </p>
            </div>

            {prepared ? (
              <>
                <CopyBlock
                  title="Prepared matter summary"
                  text={prepared.summary}
                  copied={copied === "summary"}
                  onCopy={() => copyText(prepared.summary, "summary")}
                />
                <CopyBlock
                  title="Ready-to-send outreach message"
                  text={outreachDraft}
                  copied={copied === "message"}
                  onCopy={() => copyText(outreachDraft, "message")}
                  editable
                  onChange={setOutreachDraft}
                />
                <ContactAction
                  firm={firm}
                  contactType={contact.type}
                  message={outreachDraft}
                  talkingPoints={prepared.talkingPoints}
                  copiedForm={copied === "form"}
                  onFormContact={handleFormContact}
                />
              </>
            ) : (
              <div className="firm-empty-prep">
                <Sparkles size={18} />
                <p>Open this profile from an unlocked match to generate a prepared summary and editable outreach draft from that intake.</p>
              </div>
            )}
          </section>

          <Section eyebrow="About the firm" title="Practice depth and specialist focus">
            <p className="firm-body-copy">{firm.description}</p>
            <div className="firm-chip-panel">
              {firm.practiceAreas.map((slug) => (
                <Link key={slug} href={`/services/${slug}`} className="chip">
                  {formatPractice(slug)}
                </Link>
              ))}
            </div>
          </Section>

          <Section eyebrow="The right contact" title={`Ask for the ${matchContext?.contactRole ?? "right practice contact"}`}>
            <p className="firm-body-copy">
              Based on this matter and the firm&apos;s listed practice coverage, start by asking for the{" "}
              {matchContext?.contactRole ?? "attorney or practice group that handles this matter type"}. If the intake desk routes inquiries,
              include the prepared summary below so they can direct it internally.
            </p>
          </Section>

          <Section eyebrow="Credentials and standing" title="Signals we can show honestly">
            <div className="firm-signal-grid">
              <Signal label="Standing" value={firm.verified ? "Bar standing verified" : "Standing signal not available"} />
              <Signal label="Practice history" value={years ? `${years}+ years in practice` : "Founded date not available"} />
              <Signal label="Specialist focus" value={firm.practiceAreas.slice(0, 2).map(formatPractice).join(", ")} />
              <Signal label="Assessment" value={firm.assessment.length ? `${firm.assessment.filter((item) => item.passed).length}/${firm.assessment.length} criteria met` : "Assessment details pending"} />
            </div>
          </Section>

          <p className="firm-pricing-disclaimer">
            Budget and pricing information for this firm is not publicly available through LWYRD.
            Any fee structure, retainer, or first-step cost should be confirmed directly with the firm before engagement.
          </p>
        </main>

        <aside className="firm-profile-side">
          <div className="firm-save-row">
            <SaveFirmButton firmId={firm.id} initialSaved={initialSaved} />
          </div>
          <div className="ds-card firm-side-card">
            <h3>What to ask</h3>
            <ul className="firm-guidance-list">
              <li>Is this matter within your current scope and jurisdiction?</li>
              <li>Who would handle the work day to day?</li>
              <li>What does the first scoped step usually include?</li>
              <li>What timeline should I expect for a first response?</li>
            </ul>
          </div>
          <div className="ds-card firm-side-card">
            <h3>Fair engagement signals</h3>
            <p className="firm-side-copy">
              Expect clear scope, conflict checks, responsible attorney details, and written engagement terms before legal work begins.
              {responseLabels[firm.responseTime] ?? "A first response within a few business days"} is a reasonable starting expectation, not a guarantee.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        .firm-profile-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:18px;align-items:start;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:var(--shadow-sm);padding:clamp(18px,2.8vw,26px);margin-bottom:22px}
        .firm-logo{width:56px;height:56px;border:1px solid var(--navy-tint-2);border-radius:14px;background:var(--navy-tint);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
        .firm-logo.has-logo{background-color:#fff;background-position:center;background-repeat:no-repeat;background-size:contain}
        .firm-logo span{font-family:var(--display);font-size:1.55rem;color:var(--navy)}
        .firm-profile-hero h1{font-size:clamp(1.65rem,3vw,2.35rem);line-height:1.1;margin:8px 0 7px;max-width:20ch}
        .firm-profile-hero p{color:var(--muted);max-width:72ch;line-height:1.45;font-size:.92rem}
        .firm-profile-meta{display:flex;flex-wrap:wrap;gap:8px 14px;color:var(--muted);font-size:.8rem;margin-top:13px}
        .firm-profile-meta span{display:inline-flex;align-items:center;gap:6px}
        .firm-fit-score{border:1px solid var(--navy-tint-2);border-radius:14px;background:var(--navy-tint);padding:12px 14px;text-align:center;min-width:88px}
        .firm-fit-score strong{display:block;color:var(--navy);font-size:1.9rem;line-height:1}
        .firm-fit-score span{display:block;color:var(--muted);font-size:.6rem;font-weight:700;letter-spacing:.11em;text-transform:uppercase;margin-top:5px}
        .firm-profile-grid{display:grid;grid-template-columns:1fr;gap:22px}
        .firm-profile-main{display:grid;gap:16px}
        .firm-profile-side{display:grid;gap:12px;align-content:start}
        .firm-save-row{display:flex;justify-content:flex-end}
        .firm-save-row button{width:auto;min-width:108px;padding:9px 16px}
        .firm-side-card{padding:16px;border-radius:16px;box-shadow:var(--shadow-sm)}
        .firm-side-card h3{font-family:var(--body);font-size:.92rem;line-height:1.25;margin:0 0 10px;color:var(--ink);font-weight:700;letter-spacing:0}
        .firm-section{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:var(--shadow-sm);padding:clamp(16px,2.4vw,22px)}
        .firm-section h2,.firm-go-forward h2{font-size:clamp(1.15rem,2vw,1.45rem);line-height:1.18;margin:7px 0 12px}
        .firm-body-copy,.firm-side-copy{color:var(--ink-2);font-size:.86rem;line-height:1.58}
        .firm-reason-list{display:grid;gap:9px}
        .firm-reason{display:flex;gap:10px;border:1px solid var(--line);border-radius:12px;background:var(--paper-alt);padding:11px 12px}
        .firm-reason svg{color:#059669;flex:0 0 auto;margin-top:2px}
        .firm-reason strong{display:block;color:var(--ink);font-size:.86rem;margin-bottom:3px}
        .firm-reason p{color:var(--muted);font-size:.78rem;line-height:1.42}
        .firm-chip-panel{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
        .firm-signal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .firm-signal{border:1px solid var(--line);border-radius:12px;background:var(--paper-alt);padding:12px}
        .firm-signal span{display:block;color:var(--faint);font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}
        .firm-signal strong{color:var(--ink);font-size:.84rem;line-height:1.32}
        .firm-go-forward{border:1px solid var(--navy-tint-2);border-radius:18px;background:#f8fbfe;box-shadow:var(--shadow-sm);padding:clamp(17px,2.5vw,24px)}
        .firm-go-forward-head p{color:var(--muted);font-size:.86rem;line-height:1.56;max-width:76ch;margin-bottom:16px}
        .firm-copy-block{border:1px solid var(--line);border-radius:14px;background:#fff;margin-top:12px;overflow:hidden}
        .firm-copy-block-head{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line);padding:10px 12px}
        .firm-copy-block-head h3{font-size:.92rem}
        .firm-copy-block pre{white-space:pre-wrap;color:var(--ink-2);font-family:var(--body);font-size:.8rem;line-height:1.5;padding:13px;margin:0}
        .firm-editable-draft{display:block;width:100%;min-height:180px;border:0;resize:vertical;color:var(--ink-2);background:#fff;font-family:var(--body);font-size:.82rem;line-height:1.5;padding:13px;outline:none}
        .firm-contact-action{border:1px solid var(--navy-tint-2);border-radius:14px;background:#fff;padding:14px;margin-top:14px}
        .firm-contact-action h3{font-size:1rem;margin-bottom:6px}
        .firm-contact-action p{color:var(--muted);font-size:.82rem;line-height:1.5;margin-bottom:12px}
        .firm-phone-box{display:grid;gap:8px;border:1px solid var(--line);border-radius:14px;background:var(--paper-alt);padding:14px;margin-top:12px}
        .firm-phone-box strong{font-size:1.2rem;color:var(--navy)}
        .firm-guidance-list{display:grid;gap:9px;color:var(--ink-2);font-size:.78rem;line-height:1.42;list-style:none;padding:0;margin:0}
        .firm-guidance-list li{position:relative;padding-left:15px}
        .firm-guidance-list li::before{content:"";position:absolute;left:0;top:.58em;width:5px;height:5px;border-radius:999px;background:var(--navy)}
        .firm-pricing-disclaimer{color:var(--muted);font-size:.78rem;line-height:1.5;text-align:center;margin:4px auto 0;max-width:70ch}
        .firm-empty-prep{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--line);border-radius:14px;background:#fff;padding:16px;color:var(--ink-2)}
        @media(min-width:980px){.firm-profile-grid{grid-template-columns:minmax(0,2fr) minmax(240px,.52fr)}.firm-profile-side{position:sticky;top:96px;align-self:start}}
        @media(max-width:760px){.firm-profile-hero{grid-template-columns:1fr}.firm-fit-score{justify-self:start}.firm-signal-grid{grid-template-columns:1fr}.firm-save-row{justify-content:flex-start}.firm-save-row button{width:100%}}
      `}</style>
    </div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="firm-section">
      <span className="marketing-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="firm-signal">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CopyBlock({
  title,
  text,
  copied,
  onCopy,
  editable = false,
  onChange,
}: {
  title: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  editable?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="firm-copy-block">
      <div className="firm-copy-block-head">
        <h3>{title}</h3>
        <button className="btn btn-ghost" type="button" onClick={onCopy}>
          <Copy size={14} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {editable ? (
        <textarea
          className="firm-editable-draft"
          value={text}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label={title}
        />
      ) : (
        <pre>{text}</pre>
      )}
    </div>
  );
}

function ContactAction({
  firm,
  contactType,
  message,
  talkingPoints,
  copiedForm,
  onFormContact,
}: {
  firm: Firm;
  contactType: FirmContactType;
  message: string;
  talkingPoints: string[];
  copiedForm: boolean;
  onFormContact: () => void;
}) {
  const contact = contactForFirm(firm);

  if (contactType === "form") {
    return (
      <div className="firm-contact-action">
        <h3>Contact this firm</h3>
        <p>
          We&apos;ll copy your prepared message, then open the firm&apos;s contact form in a new tab.
          Paste the message into their form when you are ready to reach out.
        </p>
        <button className="btn btn-primary" type="button" onClick={onFormContact}>
          <ExternalLink size={15} /> {copiedForm ? "Message copied, opening form" : "Contact this firm"}
        </button>
      </div>
    );
  }

  if (contactType === "email") {
    return (
      <div className="firm-contact-action">
        <h3>Email this firm</h3>
        <p>
          This opens your email client with the subject and message pre-filled. Review it, edit anything you want,
          then send it yourself.
        </p>
        <a className="btn btn-primary" href={mailtoHref(firm, message)}>
          <Mail size={15} /> Open pre-filled email
        </a>
      </div>
    );
  }

  return (
    <div className="firm-contact-action">
      <h3>Call this firm</h3>
      <p>Use the talking points below so the first call starts with clear context.</p>
      <div className="firm-phone-box">
        <span>Phone</span>
        <strong><Phone size={16} /> {contact.phone}</strong>
        {talkingPoints.map((point, index) => (
          <div key={index} className="firm-reason" style={{ padding: 10 }}>
            <Clipboard size={14} />
            <div><p>{point}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
