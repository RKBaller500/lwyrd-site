"use client";

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
    .book-card{height:auto}
    .bk-main-live{min-height:680px}
    .bk-live-frame{min-height:600px}
    .bk-live-frame iframe{width:100%;height:660px;transform:none}
  }
  @media(max-width:680px){
    .book-page{padding:18px 0 42px}
    .bk-main-live{min-height:640px}
    .bk-live-frame{min-height:600px}
    .bk-live-frame iframe{height:660px}
    .bk-main-head.live{align-items:flex-start}
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
  const wireBooking = (root: HTMLElement) => {
    const main = root.querySelector<HTMLElement>("#bkMain");
    if (!main) return;

    const liveUrl = withEmbedParams(bookingUrl);
    main.classList.add("bk-main-live");
    main.innerHTML = bookingUrl
      ? `
        <div class="bk-main-head live">
          <div>
            <h2>Book a live consultation</h2>
            <div class="bk-sub">Live availability is powered by Cal.com, so these dates and times match your booking calendar.</div>
          </div>
        </div>
        <div class="bk-live-frame">
          <iframe src="${liveUrl}" title="LWYRD consultation booking calendar" loading="lazy" allow="clipboard-write"></iframe>
        </div>
      `
      : `
        <div class="bk-main-head live">
          <div>
            <h2>Calendar setup needed</h2>
            <div class="bk-sub">Add NEXT_PUBLIC_CONSULTATION_BOOKING_URL to connect live Cal.com availability.</div>
          </div>
        </div>
        <div class="bk-live-empty">
          <strong>No booking calendar is configured.</strong>
          <p>Once the Cal.com URL is set, this panel will show the live booking calendar instead of placeholder dates.</p>
        </div>
      `;
  };

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
