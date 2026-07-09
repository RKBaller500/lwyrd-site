"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createFirm, updateFirm, type FirmInput, type AttorneyInput, type AssessmentItemInput } from "@/lib/actions/admin/firms";

interface FirmFormProps {
  initialData?: FirmInput;
  mode: "create" | "edit";
  allCriteria: Array<{ id: string; label: string; description: string | null }>;
  defaultAssessment?: AssessmentItemInput[];
}

const emptyAttorney = (): AttorneyInput => ({ name: "", title: "", bio: "", barAdmissions: [] });

const inputClass = "adm-input";
const labelClass = "adm-label";
const sectionClass = "adm-card adm-stack";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function FirmForm({ initialData, mode, allCriteria, defaultAssessment }: FirmFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [id, setId] = useState(initialData?.id ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [tagline, setTagline] = useState(initialData?.tagline ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [founded, setFounded] = useState(String(initialData?.founded ?? ""));
  const [size, setSize] = useState<FirmInput["size"]>(initialData?.size ?? "boutique");
  const [billingModel, setBillingModel] = useState<FirmInput["billingModel"]>(initialData?.billingModel ?? "hourly");
  const [hourlyRate, setHourlyRate] = useState(String(initialData?.hourlyRate ?? ""));
  const [budgetMin, setBudgetMin] = useState(String(initialData?.budgetMin ?? ""));
  const [budgetMax, setBudgetMax] = useState(String(initialData?.budgetMax ?? ""));
  const [responseTime, setResponseTime] = useState<FirmInput["responseTime"]>(initialData?.responseTime ?? "24h");
  const [overallScore, setOverallScore] = useState(String(initialData?.overallScore ?? ""));
  const [verified, setVerified] = useState(initialData?.verified ?? false);
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [practiceAreas, setPracticeAreas] = useState((initialData?.practiceAreas ?? []).join(", "));
  const [industries, setIndustries] = useState((initialData?.industries ?? []).join(", "));
  const [companyStages, setCompanyStages] = useState((initialData?.companyStages ?? []).join(", "));
  const [languages, setLanguages] = useState((initialData?.languages ?? []).join(", "));
  const [strengths, setStrengths] = useState((initialData?.strengths ?? []).join("\n"));
  const [attorneys, setAttorneys] = useState<AttorneyInput[]>(initialData?.attorneys ?? [emptyAttorney()]);
  const [assessmentItems, setAssessmentItems] = useState<AssessmentItemInput[]>(
    initialData?.assessmentItems ?? defaultAssessment ?? []
  );

  const splitCsv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const handleSave = () => {
    setError("");
    const data: FirmInput = {
      id: id.trim(),
      name: name.trim(),
      tagline: tagline.trim(),
      location: location.trim(),
      founded: parseInt(founded) || 0,
      size,
      billingModel,
      hourlyRate: hourlyRate ? parseInt(hourlyRate) : null,
      budgetMin: parseInt(budgetMin) || 0,
      budgetMax: parseInt(budgetMax) || 0,
      responseTime,
      overallScore: parseInt(overallScore) || 0,
      verified,
      logoUrl: logoUrl.trim() || null,
      description: description.trim(),
      practiceAreas: splitCsv(practiceAreas),
      industries: splitCsv(industries),
      companyStages: splitCsv(companyStages),
      languages: splitCsv(languages),
      strengths: strengths.split("\n").map((s) => s.trim()).filter(Boolean),
      attorneys: attorneys.filter((a) => a.name.trim()),
      assessmentItems,
    };

    if (!data.id || !data.name) {
      setError("ID and Name are required.");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createFirm(data)
          : await updateFirm(initialData!.id, data);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/firms");
      }
    });
  };

  return (
    <div className="adm-form">
      {/* Basic info */}
      <div className={sectionClass}>
        <h2 className="adm-card-title">Basic Info</h2>
        <div className="adm-row">
          <Field label="ID (URL slug, e.g. meridian-legal)">
            <input className={inputClass} value={id} onChange={(e) => setId(e.target.value)} placeholder="my-firm-name" disabled={mode === "edit"} />
          </Field>
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Firm Name" />
          </Field>
        </div>
        <Field label="Tagline">
          <input className={inputClass} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One-line description" />
        </Field>
        <div className="adm-row">
          <Field label="Location">
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </Field>
          <Field label="Founded (year)">
            <input type="number" className={inputClass} value={founded} onChange={(e) => setFounded(e.target.value)} placeholder="2015" />
          </Field>
        </div>
        <div className="adm-row adm-row-3">
          <Field label="Size">
            <select className="adm-select" value={size} onChange={(e) => setSize(e.target.value as FirmInput["size"])}>
              <option value="boutique">Boutique</option>
              <option value="mid-size">Mid-size</option>
              <option value="large">Large</option>
            </select>
          </Field>
          <Field label="Billing Model">
            <select className="adm-select" value={billingModel} onChange={(e) => setBillingModel(e.target.value as FirmInput["billingModel"])}>
              <option value="hourly">Hourly</option>
              <option value="retainer">Retainer</option>
              <option value="flat-fee">Flat fee</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
          <Field label="Response Time">
            <select className="adm-select" value={responseTime} onChange={(e) => setResponseTime(e.target.value as FirmInput["responseTime"])}>
              <option value="same-day">Same day</option>
              <option value="24h">24 hours</option>
              <option value="48h">48 hours</option>
              <option value="72h">72 hours</option>
            </select>
          </Field>
        </div>
        <div className="adm-row adm-row-3">
          <Field label="Hourly Rate ($, optional)">
            <input type="number" className={inputClass} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="450" />
          </Field>
          <Field label="Budget Min ($/mo)">
            <input type="number" className={inputClass} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="3000" />
          </Field>
          <Field label="Budget Max ($/mo)">
            <input type="number" className={inputClass} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="15000" />
          </Field>
        </div>
        <div className="adm-row">
          <Field label="LWYRD Score (0–100)">
            <input type="number" className={inputClass} value={overallScore} onChange={(e) => setOverallScore(e.target.value)} placeholder="85" min="0" max="100" />
          </Field>
          <Field label="Logo URL (optional)">
            <input className={inputClass} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </Field>
        </div>
        <label className="adm-inline-check">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          LWYRD Verified
        </label>
      </div>

      {/* Arrays */}
      <div className={sectionClass}>
        <h2 className="adm-card-title">Categories & Tags</h2>
        <p className="adm-hint" style={{marginTop:0}}>Separate values with commas.</p>
        <Field label="Practice Areas (category slugs, e.g. startup-law, contract-law)">
          <input className={inputClass} value={practiceAreas} onChange={(e) => setPracticeAreas(e.target.value)} placeholder="startup-law, contract-law" />
        </Field>
        <Field label="Industries (e.g. tech, fintech, healthcare)">
          <input className={inputClass} value={industries} onChange={(e) => setIndustries(e.target.value)} placeholder="tech, fintech" />
        </Field>
        <Field label="Company Stages (e.g. pre-seed, seed, series-a)">
          <input className={inputClass} value={companyStages} onChange={(e) => setCompanyStages(e.target.value)} placeholder="pre-seed, seed, series-a" />
        </Field>
        <Field label="Languages">
          <input className={inputClass} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Spanish" />
        </Field>
        <Field label="Strengths (one per line)">
          <textarea rows={4} className={inputClass + " resize-none"} value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder="Deep experience with seed-stage deals&#10;Strong VC network" />
        </Field>
      </div>

      {/* Description */}
      <div className={sectionClass}>
        <h2 className="adm-card-title">Description</h2>
        <textarea rows={5} className={inputClass + " resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description of the firm..." />
      </div>

      {/* Attorneys */}
      <div className={sectionClass}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="adm-card-title">Attorneys</h2>
          <button type="button" onClick={() => setAttorneys([...attorneys, emptyAttorney()])} className="adm-add-btn">
            <Plus size={14} /> Add Attorney
          </button>
        </div>
        {attorneys.map((att, i) => (
          <div key={i} className="adm-subcard">
            <button type="button" onClick={() => setAttorneys(attorneys.filter((_, j) => j !== i))} className="adm-subcard-del">
              <Trash2 size={14} />
            </button>
            <div className="adm-row">
              <Field label="Name">
                <input className={inputClass} value={att.name} onChange={(e) => { const a = [...attorneys]; a[i] = { ...a[i], name: e.target.value }; setAttorneys(a); }} placeholder="Jane Smith" />
              </Field>
              <Field label="Title">
                <input className={inputClass} value={att.title} onChange={(e) => { const a = [...attorneys]; a[i] = { ...a[i], title: e.target.value }; setAttorneys(a); }} placeholder="Managing Partner" />
              </Field>
            </div>
            <Field label="Bio">
              <textarea rows={2} className={inputClass + " resize-none"} value={att.bio} onChange={(e) => { const a = [...attorneys]; a[i] = { ...a[i], bio: e.target.value }; setAttorneys(a); }} placeholder="Short bio..." />
            </Field>
            <Field label="Bar Admissions (comma-separated)">
              <input className={inputClass} value={att.barAdmissions.join(", ")} onChange={(e) => { const a = [...attorneys]; a[i] = { ...a[i], barAdmissions: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }; setAttorneys(a); }} placeholder="California, New York" />
            </Field>
          </div>
        ))}
      </div>

      {/* Assessment Items, standard checklist */}
      <div className={sectionClass}>
        <div>
          <h2 className="adm-card-title">LWYRD Assessment</h2>
          <p className="adm-hint" style={{ marginTop: 4 }}>Toggle pass/fail for each standard criterion. Add an optional note per item.</p>
        </div>
        {assessmentItems.map((item, i) => {
          const criterion = allCriteria.find((c) => c.id === item.criterionId);
          return (
            <div key={item.criterionId} className="adm-subcard">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={item.passed}
                  onChange={(e) => { const a = [...assessmentItems]; a[i] = { ...a[i], passed: e.target.checked }; setAssessmentItems(a); }}
                  style={{ marginTop: 2, width: 16, height: 16, accentColor: "var(--navy)", flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--ink)" }}>{criterion?.label}</p>
                  {criterion?.description && (
                    <p className="adm-hint" style={{ marginTop: 2 }}>{criterion.description}</p>
                  )}
                </div>
              </div>
              <input
                className={inputClass}
                value={item.note}
                onChange={(e) => { const a = [...assessmentItems]; a[i] = { ...a[i], note: e.target.value }; setAssessmentItems(a); }}
                placeholder="Optional note for this criterion"
              />
            </div>
          );
        })}
      </div>

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-form-actions">
        <button onClick={handleSave} disabled={isPending} className="adm-btn adm-btn-primary">
          {isPending ? "Saving…" : mode === "create" ? "Create firm" : "Save changes"}
        </button>
        <button onClick={() => router.push("/admin/firms")} className="adm-btn adm-btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
