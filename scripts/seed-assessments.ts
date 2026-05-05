// Run once: npx tsx scripts/seed-assessments.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// All firms are heavily vetted before listing. Every firm passes the vast
// majority of quality criteria. The few failures reflect documented exceptions.
const firmAssessments: Record<string, Record<string, { passed: boolean; note?: string }>> = {

  "meridian-legal": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "5 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true, note: "Managing partner has 20 years; founded 2011." },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true, note: "Dedicated partner assigned to every client from day one." },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "24-hour response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true, note: "Flat-fee packages and hybrid pricing clearly disclosed." },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },

  "apex-ventures-law": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "4 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true, note: "Founding partner has 12 years at Debevoise before founding Apex." },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "24-hour response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },

  "nova-ip-partners": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "3 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true, note: "Founded 2014; attorneys average 8+ years in IP." },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "48-hour response commitment met." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true, note: "Flat-fee billing model with full upfront disclosure." },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: false, note: "Not confirmed during vetting." },
  },

  "harbor-employment": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "4 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "24-hour response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },

  "summit-ma-advisors": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "5 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "Same-day response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },

  "pacific-immigration-law": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "3 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "24-hour response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true, note: "Flat-fee billing with clear upfront pricing." },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: false, note: "Not confirmed during vetting." },
  },

  "clover-family-law": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "3 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "48-hour response commitment met." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: false, note: "Not confirmed during vetting." },
  },

  "ironclad-real-estate": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "4 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "24-hour response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true, note: "Flat-fee billing with full upfront disclosure." },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: false, note: "Not confirmed during vetting." },
  },

  "vertex-corporate": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "5 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "Same-day response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },

  "brightfield-pi": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "3 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "Same-day response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true, note: "Contingency-based — no upfront cost to clients." },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: false, note: "Not confirmed during vetting." },
  },

  "centennial-fund-law": {
    "Active & In Good Standing with State Bar": { passed: true },
    "No Disciplinary History (Past 5 Years)": { passed: true },
    "Carries Professional Liability Insurance": { passed: true },
    "Client References Verified": { passed: true, note: "5 verified references on file." },
    "Minimum 5 Years in Core Practice Area": { passed: true },
    "Written Engagement Agreement Provided": { passed: true },
    "Conflicts of Interest Check Performed": { passed: true },
    "Dedicated Point of Contact for Each Client": { passed: true },
    "Responds to Client Inquiries Within 48 Hours": { passed: true, note: "Same-day response commitment." },
    "Transparent Fee Structure Disclosed Upfront": { passed: true },
    "Itemized Billing Provided": { passed: true },
    "Secure Document Handling & Confidentiality Practices": { passed: true },
    "Proactively Communicates Relevant Legal Updates": { passed: true },
  },
};

async function seedAssessments() {
  console.log("Fetching assessment criteria from database...");

  const { data: criteria, error: criteriaError } = await supabase
    .from("assessment_criteria")
    .select("id, label")
    .eq("active", true)
    .order("display_order");

  if (criteriaError || !criteria) {
    console.error("Failed to fetch criteria:", criteriaError?.message);
    process.exit(1);
  }

  console.log(`Found ${criteria.length} criteria.\n`);

  for (const [firmId, assessmentMap] of Object.entries(firmAssessments)) {
    console.log(`Processing ${firmId}...`);

    await supabase.from("firm_assessment_items").delete().eq("firm_id", firmId);

    const rows = criteria.map((c, i) => {
      const entry = assessmentMap[c.label];
      return {
        firm_id: firmId,
        criterion_id: c.id,
        passed: entry?.passed ?? true,
        note: entry?.note ?? null,
        display_order: i,
      };
    });

    const { error } = await supabase.from("firm_assessment_items").insert(rows);
    if (error) {
      console.error(`  Error for ${firmId}:`, error.message);
    } else {
      const passCount = rows.filter((r) => r.passed).length;
      console.log(`  ✓ ${passCount}/${rows.length} criteria passed`);
    }
  }

  console.log("\nAssessment seeding complete!");
}

seedAssessments().catch((e) => {
  console.error(e);
  process.exit(1);
});
