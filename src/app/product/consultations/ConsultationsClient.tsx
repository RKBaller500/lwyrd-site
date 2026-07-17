"use client";

import { useCallback } from "react";
import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body } from "@/components/marketing/pages/consultations.data";

const liveCalendarCss = `
  .book-page{padding:clamp(18px,2.2vw,30px) 0 clamp(34px,5vw,64px)}
  .book-card{grid-template-columns:minmax(300px,360px) 1fr;min-height:0;height:min(720px,calc(100vh - 118px))}
  .bk-info{padding:clamp(26px,2.7vw,38px)}
  .bk-info h1{font-size:clamp(1.65rem,2.05vw,2rem);margin-bottom:.95rem}
  .bk-info .bk-lede{font-size:.95rem;line-height:1.55;margin-bottom:1.45rem}
  .bk-why{gap:.82rem}
  .bk-why li{font-size:.9rem;line-height:1.42}
  .bk-who{margin-top:1.45rem;padding-top:1.2rem}
  .bk-main{padding:clamp(24px,2.6vw,36px)}
  .bk-main-live{min-height:0;height:100%;overflow:hidden}
  .bk-main-head.live{margin-bottom:16px}
  .bk-main-head.live h2{font-size:clamp(1.35rem,1.8vw,1.55rem)}
  .bk-main-head.live .bk-sub{max-width:68ch}
  .bk-live-frame{flex:1;min-height:0;height:100%;border:1px solid var(--line);border-radius:18px;background:#fff;overflow:hidden;box-shadow:var(--shadow-sm)}
  .bk-live-frame iframe{display:block;width:117.7%;height:calc(100% / .85);border:0;background:#fff;transform:scale(.85);transform-origin:top left}
  .bk-live-empty{display:grid;place-items:center;text-align:center;min-height:520px;border:1px solid var(--line);border-radius:18px;background:var(--paper-alt);padding:28px;color:var(--muted)}
  .bk-live-empty strong{display:block;color:var(--ink);font-size:1rem;margin-bottom:8px}
  .bk-live-empty p{max-width:38ch}
  .bk-request-form{display:grid;gap:14px;width:100%;max-width:620px}
  .bk-request-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .bk-request-form label{display:grid;gap:6px;font-size:.78rem;font-weight:600;color:var(--ink-2)}
  .bk-request-form input,.bk-request-form select,.bk-request-form textarea{width:100%;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);font:inherit;font-size:.92rem;padding:11px 12px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}
  .bk-request-form textarea{min-height:104px;resize:vertical;grid-column:1/-1}
  .bk-request-form input:focus,.bk-request-form select:focus,.bk-request-form textarea:focus{border-color:var(--navy);box-shadow:0 0 0 3px rgba(0,43,85,.12)}
  .bk-request-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .bk-request-status{font-size:.88rem;color:var(--muted)}
  .bk-request-status.ok{color:#1a7a4a}
  .bk-request-status.err{color:#b42318}
  @media(min-width:1200px) and (max-height:900px){
    .book-card{height:min(650px,calc(100vh - 108px))}
    .bk-info h1{font-size:1.78rem}
    .bk-info .bk-lede{font-size:.9rem;margin-bottom:1.2rem}
    .bk-why{gap:.68rem}
    .bk-why li{font-size:.84rem}
    .bk-who{margin-top:1.1rem;padding-top:1rem}
    .bk-main-head.live{margin-bottom:12px}
    .bk-live-frame iframe{width:125%;height:calc(100% / .8);transform:scale(.8)}
  }
  @media(max-width:940px){
    .book-card{grid-template-columns:1fr;height:auto}
    .bk-main-live{min-height:680px}
    .bk-live-frame{min-height:600px}
    .bk-live-frame iframe{width:100%;height:660px;transform:none}
  }
  @media(max-width:680px){
    .book-page{padding:18px 0 42px}
    .book-card{grid-template-columns:1fr}
    .book-card{border-radius:18px}
    .bk-info{padding:24px}
    .bk-info h1{font-size:clamp(1.52rem,8vw,1.9rem)}
    .bk-why{gap:.72rem}
    .bk-why li{font-size:.88rem}
    .bk-who{display:none}
    .bk-main{padding:20px}
    .bk-main-live{min-height:640px}
    .bk-live-frame{min-height:600px}
    .bk-live-frame iframe{height:660px}
    .bk-main-head.live{align-items:flex-start}
    .bk-request-grid{grid-template-columns:1fr}
    .bk-request-form textarea{grid-column:auto}
    .bk-request-actions .btn{width:100%}
  }
`;

function withEmbedParams(url: string) {
  if (!url) return "";
  try {
    const next = new URL(url);
    next.searchParams.set("embed", "true");
    next.searchParams.set("theme", "light");
    next.searchParams.set("hide_event_type_details", "true");
    next.searchParams.set("utm_source", "lwyrd");
    next.searchParams.set("utm_medium", "consultations_page");
    return next.toString();
  } catch {
    return url;
  }
}

export default function ConsultationsClient({ bookingUrl }: { bookingUrl: string }) {
  const wireBooking = useCallback((root: HTMLElement) => {
    const main = root.querySelector<HTMLElement>("#bkMain");
    if (!main) return;

    const liveUrl = withEmbedParams(bookingUrl);
    main.classList.add("bk-main-live");
    if (bookingUrl) {
      main.innerHTML = `
        <div class="bk-main-head live">
          <div>
            <h2>Book a live consultation</h2>
          </div>
        </div>
        <div class="bk-live-frame">
          <iframe src="${liveUrl}" title="LWYRD consultation booking calendar" loading="lazy" allow="clipboard-write"></iframe>
        </div>
      `;
      return;
    }

    main.innerHTML = `
        <div class="bk-main-head live">
          <div>
            <h2>Request a consultation</h2>
            <div class="bk-sub">Send the details and LWYRD will follow up with available times.</div>
          </div>
        </div>
        <form class="bk-request-form" id="consultationRequestForm">
          <input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0" />
          <div class="bk-request-grid">
            <label>Name<input name="name" autocomplete="name" required /></label>
            <label>Email<input name="email" type="email" autocomplete="email" required /></label>
            <label>Preferred day<input name="preferredDay" type="date" min="${new Date().toISOString().slice(0, 10)}" required /></label>
            <label>Best time<select name="preferredTime" required>
              <option value="">Choose one</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select></label>
          </div>
          <label>What should we know?<textarea name="notes" minlength="20" required placeholder="Briefly describe the situation, deadline, and what you want help deciding."></textarea></label>
          <div class="bk-request-actions">
            <button class="btn btn-primary" type="submit">Send request</button>
            <span class="bk-request-status" id="consultationRequestStatus">Usually answered within one business day.</span>
          </div>
        </form>
      `;

    const form = main.querySelector<HTMLFormElement>("#consultationRequestForm");
    const status = main.querySelector<HTMLElement>("#consultationRequestStatus");
    if (!form || !status) return;

    const onSubmit = async (event: SubmitEvent) => {
      event.preventDefault();
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const data = new FormData(form);
      submit?.setAttribute("disabled", "true");
      status.className = "bk-request-status";
      status.textContent = "Sending...";

      const preferredDay = String(data.get("preferredDay") ?? "");
      const preferredTime = String(data.get("preferredTime") ?? "");
      const notes = String(data.get("notes") ?? "");

      try {
        const response = await fetch("/api/consultations/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationType: "not-sure",
            name: data.get("name"),
            email: data.get("email"),
            audience: "not-sure",
            matter: "consultation-request",
            urgency: "flexible",
            preferredContact: "email",
            company: data.get("company"),
            notes: `Preferred day: ${preferredDay}\nBest time: ${preferredTime}\n\n${notes}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sourcePath: "/product/consultations",
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error ?? "We could not send the request.");
        form.reset();
        status.className = "bk-request-status ok";
        status.textContent = "Request sent. We will follow up by email.";
      } catch (error) {
        status.className = "bk-request-status err";
        status.textContent = error instanceof Error ? error.message : "We could not send the request.";
      } finally {
        submit?.removeAttribute("disabled");
      }
    };

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [bookingUrl]);

  return (
    <MarketingPageClient
      css={css + liveCalendarCss}
      body={body}
      js=""
      current="product"
      currentItem="consultations"
      onReady={wireBooking}
    />
  );
}
