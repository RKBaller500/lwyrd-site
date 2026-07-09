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
    <div className="adm-form">
      <div className={sectionClass}>
        <h2 className="adm-card-title">Basic Info</h2>
        <div className="adm-row">
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
        <div className="adm-row">
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
        <h2 className="adm-card-title">Descriptions</h2>
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

      {error && <div className="adm-error">{error}</div>}

      <div className="adm-form-actions">
        <button onClick={handleSave} disabled={isPending} className="adm-btn adm-btn-primary">
          {isPending ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
        </button>
        <button onClick={() => router.push("/admin/categories")} className="adm-btn adm-btn-ghost">
          Cancel
        </button>
      </div>
    </div>
  );
}
