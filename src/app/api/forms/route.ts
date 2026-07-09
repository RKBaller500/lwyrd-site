import { NextResponse } from "next/server";

const DEFAULT_FORM_ENDPOINT = "https://formsubmit.co/ajax/rahul@lwyrd.co";
const MAX_FIELDS = 40;
const MAX_FIELD_LENGTH = 4000;

type FormPayload = Record<string, unknown>;

function cleanString(value: unknown, max = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanPayload(body: FormPayload) {
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(body).slice(0, MAX_FIELDS)) {
    const cleanKey = cleanString(key, 80);
    if (!cleanKey) continue;

    const cleanValue = cleanString(value);
    if (cleanValue) payload[cleanKey] = cleanValue;
  }
  return payload;
}

async function parseFormSubmitResponse(response: Response) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`FormSubmit failed with ${response.status}: ${text.slice(0, 240)}`);
  }

  if (!text) return;

  try {
    const data = JSON.parse(text) as { success?: boolean | string };
    if (data.success === false || data.success === "false") {
      throw new Error("FormSubmit did not acknowledge the submission.");
    }
  } catch (error) {
    if (error instanceof SyntaxError) return;
    throw error;
  }
}

async function postJson(endpoint: string, payload: Record<string, string>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  await parseFormSubmitResponse(response);
}

async function postUrlEncoded(endpoint: string, payload: Record<string, string>) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(payload),
  });

  await parseFormSubmitResponse(response);
}

export async function POST(request: Request) {
  let body: FormPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const payload = cleanPayload(body);
  if (payload.company) {
    return NextResponse.json({ ok: true });
  }

  const email = payload.email?.toLowerCase() ?? "";
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  if (!payload.formType && !payload._subject) {
    return NextResponse.json({ error: "Missing form type." }, { status: 422 });
  }

  const endpoint = process.env.FORMSUBMIT_ENDPOINT ?? DEFAULT_FORM_ENDPOINT;
  const submission = {
    _template: "table",
    _captcha: "false",
    ...payload,
    email,
    sourcePath: payload.sourcePath || request.headers.get("referer") || "Unknown",
  };

  try {
    await postJson(endpoint, submission);
  } catch (jsonError) {
    try {
      await postUrlEncoded(endpoint, submission);
    } catch {
      console.error("Form submission failed", jsonError);
      return NextResponse.json(
        { error: "We could not send the form. Please email rahul@lwyrd.co directly." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
