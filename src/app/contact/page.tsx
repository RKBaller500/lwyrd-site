"use client";

import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/contact.data";
import { submitForm } from "@/lib/formsubmit";

export default function ContactPage() {
  const wireForm = (root: HTMLElement) => {
    const form = root.querySelector<HTMLFormElement>(".contact-form");
    if (!form) return;

    const actions = form.querySelector<HTMLElement>(".form-actions");
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    const setStatus = (msg: string, ok: boolean) => {
      let note = form.querySelector<HTMLParagraphElement>(".form-status");
      if (!note) {
        note = document.createElement("p");
        note.className = "form-status form-note";
        actions?.insertAdjacentElement("afterend", note);
      }
      note.textContent = msg;
      note.style.color = ok ? "#0f7a3d" : "#b42318";
    };

    const onSubmit = async (e: Event) => {
      e.preventDefault();
      const data = new FormData(form);
      const payload: Record<string, string> = {};
      data.forEach((v, k) => (payload[k] = String(v)));
      payload._subject = "New LWYRD contact form message";

      if (submitBtn) submitBtn.disabled = true;
      setStatus("Sending…", true);
      try {
        await submitForm(payload);
        form.reset();
        setStatus("Thanks — your message has been sent. We'll be in touch soon.", true);
      } catch {
        setStatus("Something went wrong. Please try again or email rahul@lwyrd.co.", false);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    // Capture phase so we run before the embedded preventDefault-only handler.
    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  };

  return (
    <MarketingPageClient
      css={css}
      body={body}
      js={js}
      current="help"
      onReady={wireForm}
    />
  );
}
