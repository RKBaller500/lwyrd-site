"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import MarketingNav from "./MarketingNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Section =
  | "product"
  | "clients"
  | "law-firms"
  | "about"
  | "blog"
  | "help";

/**
 * Renders a ported design page: injects the page's exact CSS, the shared
 * React nav, the page body markup, then runs the page's original JS.
 *
 * The design uses a light theme with a white <body>; the page CSS sets that.
 * We also suppress the root layout's dark ambient gradient overlay while a
 * marketing page is mounted.
 */
export default function MarketingPageClient({
  css,
  body,
  js,
  current,
  onReady,
}: {
  css: string;
  body: string;
  js: string;
  current?: Section;
  onReady?: (root: HTMLElement) => void | (() => void);
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { isAuthenticated, openModal } = useAuth();
  const router = useRouter();

  // Intercept ported-design CTAs so generated markup cannot strand users on
  // placeholder hashes or bypass the login-first intake flow.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const label = (a.textContent ?? "").trim().replace(/\s+/g, " ");
      const lowerLabel = label.toLowerCase();
      const isGetMatched =
        href.startsWith("/get-matched") ||
        a.id === "heroCta" ||
        lowerLabel.startsWith("get matched");
      const legalRoutes: Record<string, string> = {
        Privacy: "/privacy",
        Terms: "/terms",
        Disclosures: "/disclosures",
      };

      if (href === "#" && legalRoutes[label]) {
        e.preventDefault();
        e.stopPropagation();
        router.push(legalRoutes[label]);
        return;
      }

      if (href === "#" && ["Startups", "SMBs", "Individuals"].includes(label)) {
        e.preventDefault();
        e.stopPropagation();
        if (isAuthenticated) router.push("/intake/start");
        else openModal("login", "/intake/start");
        return;
      }

      if (!isGetMatched) return;
      e.preventDefault();
      e.stopPropagation();
      if (isAuthenticated) router.push("/intake/start");
      else {
        const signup = href.includes("tab=signup");
        openModal(signup ? "signup" : "login", "/intake/start");
      }
    };
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("click", onClick, true);
    };
  }, [body, isAuthenticated, openModal, router]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cleanup: void | (() => void);
    const shouldRunOriginalJs =
      js && !body.includes('id="heroMaze"') && !body.includes('class="faq');

    // Run the page's original JS (maze, reveals, accordions, smooth scroll).
    // We inject it as a real inline <script> rather than eval/new Function so
    // it runs under the production CSP's script-src 'unsafe-inline' (which does
    // NOT permit eval). Wrapped in an IIFE so re-running on client navigation
    // doesn't redeclare the design's top-level `const`/`let` globals.
    let scriptEl: HTMLScriptElement | null = null;
    if (shouldRunOriginalJs) {
      scriptEl = document.createElement("script");
      scriptEl.textContent = `;(function(){\ntry{\n${js}\n}catch(e){console.error("Marketing page script error:",e);}\n})();`;
      document.body.appendChild(scriptEl);
    }

    if (onReady) cleanup = onReady(root);

    return () => {
      if (typeof cleanup === "function") cleanup();
      if (scriptEl) scriptEl.remove();
    };
    // Re-run only when the page content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, js]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            // Design display/body fonts (the original <head> link was stripped).
            "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&family=Libre+Baskerville:wght@400;700&display=swap');\n" +
            css +
            /* keep the dark root overlay off marketing pages */
            "\n#ambient-overlay{display:none !important;}\n",
        }}
      />
      <Script src="/marketing-animations.js" strategy="afterInteractive" />
      <MarketingNav current={current} />
      <div ref={ref} data-marketing-page-root dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
