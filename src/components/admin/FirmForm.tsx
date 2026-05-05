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

const inputClass = "w-full px-4 py-2.5 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";
const labelClass = "block text-xs text-slate-400 font-medium mb-1.5";
const sectionClass = "bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 space-y-5";

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
    <div className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <div className={sectionClass}>
        <h2 className="text-lg text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}>Basic Info</h2>
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <input className={inputClass} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" />
          </Field>
          <Field label="Founded (year)">
            <input type="number" className={inputClass} value={founded} onChange={(e) => setFounded(e.target.value)} placeholder="2015" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Size">
            <select className={inputClass} value={size} onChange={(e) => setSize(e.target.value as FirmInput["size"])}>
              <option value="boutique">Boutique</option>
              <option value="mid-size">Mid-size</option>
              <option value="large">Large</option>
            </select>
          </Field>
          <Field label="Billing Model">
            <select className={inputClass} value={billingModel} onChange={(e) => setBillingModel(e.target.value as FirmInput["billingModel"])}>
              <option value="hourly">Hourly</option>
              <option value="retainer">Retainer</option>
              <option value="flat-fee">Flat fee</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
          <Field label="Response Time">
            <select className={inputClass} value={responseTime} onChange={(e) => setResponseTime(e.target.value as FirmInput["responseTime"])}>
              <option value="same-day">Same day</option>
              <option value="24h">24 hours</option>
              <option value="48h">48 hours</option>
              <option value="72h">72 hours</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          <Field label="LWYRD Score (0–100)">
            <input type="number" className={inputClass} value={overallScore} onChange={(e) => setOverallScore(e.target.value)} placeholder="85" min="0" max="100" />
          </Field>
          <Field label="Logo URL (optional)">
            <input className={inputClass} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="verified" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="w-4 h-4 accent-[#002452]" />
          <label htmlFor="verified" className="text-sm text-slate-600">LWYRD Verified</label>
        </div>
      </div>

      {/* Arrays */}
      <div className={sectionClass}>
        <h2 className="text-lg text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}>Categories & Tags</h2>
        <p className="text-xs text-slate-400">Separate values with commas.</p>
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
        <h2 className="text-lg text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}>Description</h2>
        <textarea rows={5} className={inputClass + " resize-none"} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description of the firm..." />
      </div>

      {/* Attorneys */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}>Attorneys</h2>
          <button type="button" onClick={() => setAttorneys([...attorneys, emptyAttorney()])} className="flex items-center gap-1.5 text-sm text-[#002452] hover:opacity-70 transition-opacity">
            <Plus size={14} /> Add Attorney
          </button>
        </div>
        {attorneys.map((att, i) => (
          <div key={i} className="border border-[#ddd7cc] rounded-2xl p-4 space-y-3 relative">
            <button type="button" onClick={() => setAttorneys(attorneys.filter((_, j) => j !== i))} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-2 gap-3">
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

      {/* Assessment Items — standard checklist */}
      <div className={sectionClass}>
        <div>
          <h2 className="text-lg text-[#002452]" style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}>LWYRD Assessment</h2>
          <p className="text-xs text-slate-400 mt-1">Toggle pass/fail for each standard criterion. Add an optional note per item.</p>
        </div>
        {assessmentItems.map((item, i) => {
          const criterion = allCriteria.find((c) => c.id === item.criterionId);
          return (
            <div key={item.criterionId} className="border border-[#ddd7cc] rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.passed}
                  onChange={(e) => { const a = [...assessmentItems]; a[i] = { ...a[i], passed: e.target.checked }; setAssessmentItems(a); }}
                  className="mt-0.5 w-4 h-4 accent-[#002452] shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-slate-700">{criterion?.label}</p>
                  {criterion?.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{criterion.description}</p>
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pb-10">
        <button onClick={handleSave} disabled={isPending} className="px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
          {isPending ? "Saving..." : mode === "create" ? "Create Firm" : "Save Changes"}
        </button>
        <button onClick={() => router.push("/admin/firms")} className="px-6 py-3 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm hover:border-[#002452] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
