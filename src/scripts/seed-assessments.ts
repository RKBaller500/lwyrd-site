/**
 * Seed LWYRD assessment items for all 12 firms.
 *
 * Run with: npx tsx src/scripts/seed-assessments.ts
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Criterion IDs (from assessment_criteria table) ────────────────────────────

const C = {
  bar:        "2a230e65-4b9d-4ce7-a7f2-f74ba6f2eb43", // Active & In Good Standing with State Bar
  discipline: "90b3dd87-40e5-4eef-af08-b57b1a594977", // No Disciplinary History (Past 5 Years)
  insurance:  "3f5e578c-4225-49db-b715-e95971f2498d", // Carries Professional Liability Insurance
  references: "8b342cac-492d-422d-92be-bf78d952391c", // Client References Verified
  experience: "dac5495d-dfc3-4f3d-95c8-147a65905966", // Minimum 5 Years in Core Practice Area
  engagement: "781a8c36-710a-45d1-ae1f-f0a18490b9cf", // Written Engagement Agreement Provided
  conflicts:  "de426bb1-b3b2-4fa7-9206-0c095fbfbb37", // Conflicts of Interest Check Performed
  contact:    "41dd9c19-822c-4892-85c5-73803222d212", // Dedicated Point of Contact for Each Client
  response:   "83ddfca3-ffcd-4024-a1f4-37e4f1a2dd38", // Responds to Client Inquiries Within 48 Hours
  fees:       "d68f1f48-9974-44bd-ab84-90c4e47915ae", // Transparent Fee Structure Disclosed Upfront
  billing:    "a0076a87-d56b-4970-8732-ad90a768a855", // Itemized Billing Provided
  security:   "a9c6994d-d2d6-4aa4-b2e7-b63b74fe36db", // Secure Document Handling & Confidentiality Practices
  updates:    "df5c3e12-493c-41df-8da6-32af26b651d7", // Proactively Communicates Relevant Legal Updates
};

// Helper: build a full pass record with an optional note
function pass(criterionId: string, note?: string) {
  return { criterion_id: criterionId, passed: true, note: note ?? null };
}
function fail(criterionId: string, note?: string) {
  return { criterion_id: criterionId, passed: false, note: note ?? null };
}

// ── Per-firm assessments ──────────────────────────────────────────────────────

const assessments: Record<string, ReturnType<typeof pass>[]> = {

  "gunderson-dettmer": [
    pass(C.bar,        "Confirmed active across CA, NY, and additional jurisdictions."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Firm-wide professional liability coverage maintained."),
    pass(C.references, "Multiple Fortune-listed VC and portfolio company references verified."),
    pass(C.experience, "Firm founded in 1995; lead partners average 20+ years in venture transactions."),
    pass(C.engagement, "Standard engagement letters issued before all matters commence."),
    pass(C.conflicts,  "Formal conflicts clearance process in place firm-wide."),
    pass(C.contact,    "Named partner assigned to every client engagement."),
    pass(C.response,   "Documented same-day response standard for active client matters."),
    pass(C.fees,       "Rate schedules and engagement scope disclosed at outset."),
    pass(C.billing,    "Itemized monthly invoices provided for all billable work."),
    pass(C.security,   "Enterprise-grade document management and encrypted client communications."),
    pass(C.updates,    "Clients receive proactive updates on regulatory and market developments relevant to their matter."),
  ],

  "cooley-llp": [
    pass(C.bar,        "Active in all major U.S. jurisdictions including NY and CA."),
    pass(C.discipline, "No disciplinary history."),
    pass(C.insurance,  "Full professional liability coverage as standard."),
    pass(C.references, "References verified across thousands of incorporated startups."),
    pass(C.experience, "Founded 1920; emerging companies practice has operated for decades."),
    pass(C.engagement, "Written engagement agreements issued universally."),
    pass(C.conflicts,  "Firm-wide conflicts check system in place."),
    pass(C.contact,    "Each client assigned a lead attorney and backup contact."),
    pass(C.response,   "Same-day response standard for active matters."),
    pass(C.fees,       "Fee schedules disclosed at engagement; Cooley GO provides free public resources."),
    pass(C.billing,    "Itemized invoices with full work descriptions provided."),
    pass(C.security,   "Secure client portal and encrypted document management."),
    pass(C.updates,    "Clients proactively briefed on regulatory changes through newsletters and direct outreach."),
  ],

  "wilson-sonsini": [
    pass(C.bar,        "Active across CA, NY, and all major U.S. jurisdictions."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Firm-wide malpractice coverage maintained."),
    pass(C.references, "References verified across 3,000+ private company client base."),
    pass(C.experience, "Founded 1961; venture and corporate practice has 60+ years of continuous operation."),
    pass(C.engagement, "Written engagement agreements issued before work commences."),
    pass(C.conflicts,  "Robust conflicts clearance process across all offices."),
    pass(C.contact,    "Named relationship partner assigned to each client engagement."),
    pass(C.response,   "Active matter response standard is same business day."),
    pass(C.fees,       "Rate schedules and billing structure disclosed upfront via engagement letter."),
    pass(C.billing,    "Detailed itemized billing provided on all matters."),
    pass(C.security,   "Enterprise document security and encrypted communications standard."),
    pass(C.updates,    "Legal updates and market alerts delivered directly to clients on relevant matters."),
  ],

  "fenwick-west": [
    pass(C.bar,        "Active in CA, NY, and other jurisdictions."),
    pass(C.discipline, "No disciplinary history on record."),
    pass(C.insurance,  "Full professional liability insurance maintained."),
    pass(C.references, "Client references verified across major tech company relationships."),
    pass(C.experience, "Founded 1972; technology corporate practice has 50+ years of depth."),
    pass(C.engagement, "Written engagement agreements standard across all client relationships."),
    pass(C.conflicts,  "Formal conflicts clearance protocol followed for all new engagements."),
    pass(C.contact,    "Lead partner assigned and accessible for each client."),
    pass(C.response,   "Active matter response standard within same business day."),
    pass(C.fees,       "Fees and billing model disclosed at engagement commencement."),
    pass(C.billing,    "Itemized billing with detailed work descriptions."),
    pass(C.security,   "Secure client portal and encrypted communication in place."),
    pass(C.updates,    "Clients updated on relevant legal developments via direct outreach."),
  ],

  "goodwin-procter": [
    pass(C.bar,        "Active across all major U.S. jurisdictions."),
    pass(C.discipline, "No disciplinary actions in the past five years."),
    pass(C.insurance,  "Comprehensive professional liability coverage."),
    pass(C.references, "Verified references across venture and life sciences client base."),
    pass(C.experience, "Founded 1912; emerging companies practice well-established."),
    pass(C.engagement, "Written engagement letters issued universally before work begins."),
    pass(C.conflicts,  "Formal firm-wide conflicts check process in place."),
    pass(C.contact,    "Named partner or senior associate assigned to each engagement."),
    pass(C.response,   "Active matter response within same business day."),
    pass(C.fees,       "Billing model and rate structure disclosed at engagement."),
    pass(C.billing,    "Monthly itemized invoices with line-item descriptions."),
    pass(C.security,   "Secure client portal, encrypted communications, and document management."),
    pass(C.updates,    "Proactive regulatory and market updates delivered to clients."),
  ],

  "orrick": [
    pass(C.bar,        "Active across all major U.S. jurisdictions."),
    pass(C.discipline, "No disciplinary history on record."),
    pass(C.insurance,  "Full malpractice and E&O coverage maintained."),
    pass(C.references, "References verified across 4,500+ VC-backed company relationships."),
    pass(C.experience, "Founded 1863; technology and innovation practice extensively established."),
    pass(C.engagement, "Written engagement agreements standard for all client relationships."),
    pass(C.conflicts,  "Firm-wide conflicts clearance process in place."),
    pass(C.contact,    "Relationship partner assigned as primary contact for each client."),
    pass(C.response,   "Same-day response standard for active client matters."),
    pass(C.fees,       "Rate schedule and fee structure disclosed in engagement letter."),
    pass(C.billing,    "Itemized invoices provided for all billable work."),
    pass(C.security,   "Enterprise-grade document security and encrypted client communications."),
    pass(C.updates,    "Clients receive targeted legal update briefings relevant to their sector."),
  ],

  "lowenstein-sandler": [
    pass(C.bar,        "Active in NJ, NY, and additional jurisdictions."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Firm-wide professional liability insurance maintained."),
    pass(C.references, "Client references verified across venture community relationships."),
    pass(C.experience, "Founded 1961; venture practice has operated for decades with 500+ transactions/yr."),
    pass(C.engagement, "Written engagement agreements issued before all matters commence."),
    pass(C.conflicts,  "Formal conflicts check conducted for all new engagements."),
    pass(C.contact,    "Named attorney assigned to each engagement with clear lines of responsibility."),
    pass(C.response,   "Response within one business day for active client matters."),
    pass(C.fees,       "Rates and billing structure disclosed upfront in engagement letter."),
    pass(C.billing,    "Itemized monthly billing provided across all matters."),
    pass(C.security,   "Secure client communication and document handling protocols in place."),
    pass(C.updates,    "Clients kept informed of relevant regulatory and venture market updates."),
  ],

  "reitler-kailas": [
    pass(C.bar,        "Active in New York and additional jurisdictions."),
    pass(C.discipline, "No disciplinary history on record."),
    pass(C.insurance,  "Professional liability insurance maintained."),
    pass(C.references, "Multiple verified references from venture financing clients."),
    pass(C.experience, "Founded 1995; core venture practice has 30 years of continuous focus."),
    pass(C.engagement, "Engagement letters issued before all work commences."),
    pass(C.conflicts,  "Conflicts check performed at intake for all new clients."),
    pass(C.contact,    "Partner-level contact assigned to each engagement."),
    pass(C.response,   "Response within one business day standard for active matters."),
    pass(C.fees,       "Fee structure and billing model communicated at engagement."),
    pass(C.billing,    "Itemized invoices with matter-level detail."),
    pass(C.security,   "Secure document handling and encrypted communications in place."),
    pass(C.updates,    "Clients proactively informed of legal developments affecting their transactions."),
  ],

  "buhler-duggal-henry": [
    pass(C.bar,        "Confirmed active in New York."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Professional liability insurance maintained."),
    pass(C.references, "References verified across 1,000+ emerging company client relationships."),
    pass(C.experience, "Founding partners trained at AmLaw 100 firms with 15+ years of relevant experience."),
    pass(C.engagement, "Written engagement agreements provided before all work begins."),
    pass(C.conflicts,  "Conflicts check conducted for all new client intakes."),
    pass(C.contact,    "Partner-level point of contact assigned to every client matter."),
    pass(C.response,   "Responsive within one business day; boutique structure enables direct attorney access."),
    pass(C.fees,       "Billing model and rate structure disclosed clearly at engagement."),
    pass(C.billing,    "Itemized billing provided for all work performed."),
    pass(C.security,   "Secure document management and confidential communications practices maintained."),
    pass(C.updates,    "Clients kept current on relevant legal and regulatory developments."),
  ],

  "bowery-legal": [
    pass(C.bar,        "Confirmed active in New York."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Professional liability insurance maintained."),
    pass(C.references, "Client references provided and verified."),
    pass(C.experience, "Lead attorneys have 8+ years of startup formation experience prior to founding Bowery."),
    pass(C.engagement, "Written engagement agreements issued for all client relationships."),
    pass(C.conflicts,  "Conflicts check performed before accepting new engagements."),
    pass(C.contact,    "Small team structure ensures direct attorney access for every client."),
    pass(C.response,   "Response within one business day for active client matters."),
    pass(C.fees,       "Rates and billing model communicated clearly at outset."),
    pass(C.billing,    "Itemized billing provided for all billable work."),
    pass(C.security,   "Encrypted communications and secure document handling in place."),
    fail(C.updates,    "Systematic client update communications not yet documented; firm is actively building this process."),
  ],

  "triumph-law": [
    pass(C.bar,        "Confirmed active in New York."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Professional liability insurance maintained."),
    fail(C.references, "Fewer than three independently verifiable client references available at this time."),
    pass(C.experience, "Lead attorneys have 7+ years of startup formation and corporate counsel experience."),
    pass(C.engagement, "Engagement letters issued before all work commences."),
    pass(C.conflicts,  "Conflicts check conducted for new client intake."),
    pass(C.contact,    "Direct attorney access provided to all clients."),
    pass(C.response,   "Response within 48 hours; same-day response for urgent matters."),
    pass(C.fees,       "Hourly and flat-fee rates disclosed clearly at engagement."),
    pass(C.billing,    "Itemized invoices provided for hourly matters."),
    pass(C.security,   "Secure communications and document handling in place."),
    fail(C.updates,    "Proactive legal update communication to clients not yet systematized."),
  ],

  "fridman-law": [
    pass(C.bar,        "Confirmed active in New York."),
    pass(C.discipline, "No disciplinary actions on record."),
    pass(C.insurance,  "Professional liability insurance maintained."),
    fail(C.references, "Fewer than three independently verifiable client references available at this time."),
    pass(C.experience, "Lead attorneys have 7+ years of entity formation and fund formation experience."),
    pass(C.engagement, "Written engagement agreements and subscription terms provided before work begins."),
    pass(C.conflicts,  "Conflicts check performed before accepting new engagements."),
    pass(C.contact,    "Direct attorney access for all subscription and hourly clients."),
    pass(C.response,   "Response within 48 hours standard; subscription clients receive priority access."),
    pass(C.fees,       "Subscription model and hourly rates disclosed upfront; kick-off packages clearly scoped."),
    pass(C.billing,    "Itemized billing provided for hourly matters; subscription model fixed monthly."),
    pass(C.security,   "Encrypted client communications and secure document storage in place."),
    fail(C.updates,    "Proactive legal update outreach to clients not yet systematized."),
  ],
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log("Clearing existing assessment items...");
  const { error: delErr } = await db.from("firm_assessment_items").delete().neq("firm_id", "");
  if (delErr) { console.error("Delete error:", delErr.message); process.exit(1); }

  const rows: object[] = [];

  for (const [firmId, items] of Object.entries(assessments)) {
    items.forEach((item, i) => {
      rows.push({
        firm_id: firmId,
        criterion_id: item.criterion_id,
        passed: item.passed,
        note: item.note,
        display_order: i,
      });
    });
  }

  console.log(`Inserting ${rows.length} assessment items across ${Object.keys(assessments).length} firms...`);
  const { error: insErr } = await db.from("firm_assessment_items").insert(rows);
  if (insErr) { console.error("Insert error:", insErr.message); process.exit(1); }

  console.log("Done.");
}

run().catch((err) => { console.error(err); process.exit(1); });
