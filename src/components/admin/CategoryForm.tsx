"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  type CategoryInput,
} from "@/lib/actions/admin/categories";

interface CategoryFormProps {
  initialData?: CategoryInput;
  mode: "create" | "edit";
}

const inputClass =
  "w-full px-4 py-2.5 rounded-2xl border border-[#ddd7cc] bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#002452] transition-colors text-sm";
const labelClass = "block text-xs text-slate-400 font-medium mb-1.5";
const sectionClass =
  "bg-[#fbfaf6] border border-[#ddd7cc] rounded-3xl p-6 space-y-5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [icon, setIcon] = useState(initialData?.icon ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription ?? "");
  const [whatFirmsDo, setWhatFirmsDo] = useState(initialData?.whatFirmsDo ?? "");
  const [serviceExamples, setServiceExamples] = useState(
    (initialData?.serviceExamples ?? []).join("\n")
  );
  const [heroTag, setHeroTag] = useState(initialData?.heroTag ?? "");

  const handleSave = () => {
    setError("");
    const data: CategoryInput = {
      slug: slug.trim(),
      name: name.trim(),
      icon: icon.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      whatFirmsDo: whatFirmsDo.trim(),
      serviceExamples: serviceExamples
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      heroTag: heroTag.trim(),
    };

    if (!data.slug || !data.name) {
      setError("Slug and Name are required.");
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategory(data)
          : await updateCategory(initialData!.slug, data);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/categories");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className={sectionClass}>
        <h2
          className="text-lg text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Basic Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug (URL key, e.g. startup-law)">
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="startup-law"
              disabled={mode === "edit"}
            />
          </Field>
          <Field label="Name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Startup Law"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Icon (emoji or text)">
            <input
              className={inputClass}
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="⚖️"
            />
          </Field>
          <Field label="Hero Tag">
            <input
              className={inputClass}
              value={heroTag}
              onChange={(e) => setHeroTag(e.target.value)}
              placeholder="For founders building the next big thing"
            />
          </Field>
        </div>
      </div>

      <div className={sectionClass}>
        <h2
          className="text-lg text-[#002452]"
          style={{ fontFamily: '"Lora", Georgia, serif', fontWeight: 500 }}
        >
          Descriptions
        </h2>
        <Field label="Short Description (shown in browse cards)">
          <input
            className={inputClass}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Equity, SAFEs, term sheets, and fundraising agreements."
          />
        </Field>
        <Field label="Full Description (shown on category page)">
          <textarea
            rows={4}
            className={inputClass + " resize-none"}
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed description of this legal category..."
          />
        </Field>
        <Field label="What Firms Do (shown on category page)">
          <textarea
            rows={3}
            className={inputClass + " resize-none"}
            value={whatFirmsDo}
            onChange={(e) => setWhatFirmsDo(e.target.value)}
            placeholder="Firms in this category specialize in..."
          />
        </Field>
        <Field label="Service Examples (one per line)">
          <textarea
            rows={5}
            className={inputClass + " resize-none"}
            value={serviceExamples}
            onChange={(e) => setServiceExamples(e.target.value)}
            placeholder={"Incorporation & entity formation\nFounder agreements\nSAFE notes"}
          />
        </Field>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pb-10">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-8 py-3 rounded-2xl bg-[#002452] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Category" : "Save Changes"}
        </button>
        <button
          onClick={() => router.push("/admin/categories")}
          className="px-6 py-3 rounded-2xl border border-[#ddd7cc] text-slate-600 text-sm hover:border-[#002452] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
