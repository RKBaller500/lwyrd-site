import { NextResponse } from "next/server";

const DEFAULT_FORM_ENDPOINT = "https://formsubmit.co/ajax/rahul@lwyrd.co";

const consultationTypes = new Set([
  "matching-strategy",
  "startup-business",
  "individual-matter",
  "not-sure",
]);

const urgencyLevels = new Set([
  "this-week",
  "one-two-weeks",
  "this-month",
  "flexible",
]);

type ConsultationRequest = {
  consultationType?: string;
  name?: string;
  email?: string;
  phone?: string;
  audience?: string;
  matter?: string;
  urgency?: string;
  preferredContact?: string;
  intakeUrl?: string;
  notes?: string;
  bookingUrl?: string;
  timezone?: string;
  sourcePath?: string;
  company?: string;
};

function asCleanString(value: unknown, max = 1000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function humanize(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

async function postJson(url: string, payload: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
}

async function postUrlEncoded(url: string, payload: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
}

async function postForm(url: string, payload: Record<string, string>) {
  try {
    await postJson(url, payload);
  } catch {
    await postUrlEncoded(url, payload);
  }
}

export async function POST(request: Request) {
  let body: ConsultationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (asCleanString(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const consultationType = asCleanString(body.consultationType, 80) || "not-sure";
  const name = asCleanString(body.name, 120);
  const email = asCleanString(body.email, 160).toLowerCase();
  const phone = asCleanString(body.phone, 80);
  const audience = asCleanString(body.audience, 80);
  const matter = asCleanString(body.matter, 160);
  const urgency = asCleanString(body.urgency, 80);
  const preferredContact = asCleanString(body.preferredContact, 80);
  const intakeUrl = asCleanString(body.intakeUrl, 500);
  const notes = asCleanString(body.notes, 2500);
  const bookingUrl = asCleanString(body.bookingUrl, 500);
  const timezone = asCleanString(body.timezone, 120);
  const sourcePath = asCleanString(body.sourcePath, 240);

  const errors: Record<string, string> = {};
  if (!consultationTypes.has(consultationType)) errors.consultationType = "Choose a consultation type.";
  if (!name) errors.name = "Enter your name.";
  if (!email || !isValidEmail(email)) errors.email = "Enter a valid email.";
  if (!audience) errors.audience = "Choose who this is for.";
  if (!matter) errors.matter = "Choose the main topic.";
  if (!urgencyLevels.has(urgency)) errors.urgency = "Choose a timing preference.";
  if (!notes || notes.length < 20) errors.notes = "Add a few details so we can prepare.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 422 });
  }

  const payload: Record<string, string> = {
    _subject: "New LWYRD consultation request",
    "Consultation type": humanize(consultationType),
    Name: name,
    Email: email,
    Phone: phone || "Not provided",
    Audience: humanize(audience),
    Matter: humanize(matter),
    Urgency: humanize(urgency),
    "Preferred contact": preferredContact ? humanize(preferredContact) : "Not specified",
    "Intake or results URL": intakeUrl || "Not provided",
    Notes: notes,
    "Calendar handoff URL": bookingUrl || "Not configured",
    Timezone: timezone || "Not provided",
    Source: sourcePath || "/product/consultations",
  };

  const formEndpoint = process.env.CONSULTATION_FORM_ENDPOINT ?? DEFAULT_FORM_ENDPOINT;
  const webhookUrl = process.env.CONSULTATION_WEBHOOK_URL;

  try {
    await postForm(formEndpoint, payload);
    if (webhookUrl) {
      await postJson(webhookUrl, payload);
    }
  } catch {
    return NextResponse.json(
      { error: "We could not send the request. Please email rahul@lwyrd.co directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
