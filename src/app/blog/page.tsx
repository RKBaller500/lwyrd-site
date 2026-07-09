"use client";

import MarketingPageClient from "@/components/marketing/MarketingPageClient";
import { css, body, js } from "@/components/marketing/pages/blog.data";
import { submitForm } from "@/lib/formsubmit";

export default function BlogPage() {
  const wireForm = (root: HTMLElement) => {
    const form = root.querySelector<HTMLFormElement>("form.email-row");
    if (!form) return;

    const input = form.querySelector<HTMLInputElement>('input[type="email"]');
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    const setStatus = (msg: string, ok: boolean) => {
      let note = form.querySelector<HTMLParagraphElement>(".form-status");
      if (!note) {
        note = document.createElement("p");
        note.className = "form-status";
        note.style.cssText = "margin-top:.6rem;font-size:.85rem";
        form.insertAdjacentElement("afterend", note);
      }
      note.textContent = msg;
      note.style.color = ok ? "#0f7a3d" : "#b42318";
    };

    const onSubmit = async (e: Event) => {
      e.preventDefault();
      const email = input?.value.trim() ?? "";
      if (!email) {
        setStatus("Please enter your email address.", false);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setStatus("Subscribing…", true);
      try {
        await submitForm({
          email,
          formType: "Blog Subscribe",
          _subject: "New LWYRD Blog Subscriber",
          _replyto: email,
        });
        form.reset();
        setStatus("Thanks — you're subscribed.", true);
      } catch {
        setStatus("Something went wrong. Please try again or email rahul@lwyrd.co.", false);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  };

  return (
    <MarketingPageClient css={css} body={body} js={js} current="blog" onReady={wireForm} />
  );
}
