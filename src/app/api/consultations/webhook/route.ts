import { NextResponse } from "next/server";

const DEFAULT_FORM_ENDPOINT = "https://formsubmit.co/ajax/rahul@lwyrd.co";

function stringValue(value: unknown, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

function summarizePayload(payload: unknown): Record<
  "eventType" | "title" | "startTime" | "endTime" | "attendeeName" | "attendeeEmail" | "organizer" | "raw",
  string
> {
  if (!payload || typeof payload !== "object") {
    return {
      eventType: "booking_event",
      title: "",
      startTime: "",
      endTime: "",
      attendeeName: "",
      attendeeEmail: "",
      organizer: "",
      raw: "",
    };
  }
  const record = payload as Record<string, unknown>;
  const nested = (record.payload && typeof record.payload === "object"
    ? record.payload
    : record.event && typeof record.event === "object"
      ? record.event
      : record) as Record<string, unknown>;

  return {
    eventType: stringValue(record.triggerEvent ?? record.eventType ?? record.event ?? record.type, "booking_event"),
    title: stringValue(nested.title ?? nested.eventTypeSlug ?? nested.name),
    startTime: stringValue(nested.startTime ?? nested.start_time ?? nested.start),
    endTime: stringValue(nested.endTime ?? nested.end_time ?? nested.end),
    attendeeName: stringValue(nested.attendeeName ?? nested.name),
    attendeeEmail: stringValue(nested.attendeeEmail ?? nested.email),
    organizer: stringValue(nested.organizerName ?? nested.organizerEmail ?? nested.host),
    raw: JSON.stringify(payload).slice(0, 6000),
  };
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
  if (!response.ok) throw new Error(`Webhook forward failed with ${response.status}`);
}

export async function POST(request: Request) {
  const expectedSecret = process.env.CONSULTATION_WEBHOOK_SECRET;
  if (expectedSecret) {
    const url = new URL(request.url);
    const providedSecret = request.headers.get("x-lwyrd-webhook-secret") ?? url.searchParams.get("secret");
    if (providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const summary = summarizePayload(body);
  const payload: Record<string, string> = {
    _subject: "LWYRD consultation booking webhook",
    "Event type": summary.eventType,
    Title: summary.title || "Not provided",
    "Start time": summary.startTime || "Not provided",
    "End time": summary.endTime || "Not provided",
    "Attendee name": summary.attendeeName || "Not provided",
    "Attendee email": summary.attendeeEmail || "Not provided",
    Organizer: summary.organizer || "Not provided",
    "Raw payload": summary.raw,
  };

  const formEndpoint = process.env.CONSULTATION_FORM_ENDPOINT ?? DEFAULT_FORM_ENDPOINT;
  const secondaryWebhook = process.env.CONSULTATION_INTERNAL_WEBHOOK_URL;

  try {
    await postJson(formEndpoint, payload);
    if (secondaryWebhook) await postJson(secondaryWebhook, payload);
  } catch {
    return NextResponse.json({ error: "Webhook received but forwarding failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
