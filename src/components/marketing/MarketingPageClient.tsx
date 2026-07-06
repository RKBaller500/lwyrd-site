"use client";

import { useEffect, useRef } from "react";
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

  // Intercept the design's "Get matched" links (which point at /get-matched)
  // so they open the auth modal in place instead of routing to a page.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="/get-matched"]');
      if (!a) return;
      e.preventDefault();
      if (isAuthenticated) router.push("/intake/start");
      else {
        const login = (a.getAttribute("href") || "").includes("tab=login");
        openModal(login ? "login" : "signup", "/intake/start");
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [body, isAuthenticated, openModal, router]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cleanup: void | (() => void);

    // Run the page's original JS (maze, reveals, accordions, smooth scroll).
    // We inject it as a real inline <script> rather than eval/new Function so
    // it runs under the production CSP's script-src 'unsafe-inline' (which does
    // NOT permit eval). Wrapped in an IIFE so re-running on client navigation
    // doesn't redeclare the design's top-level `const`/`let` globals.
    let scriptEl: HTMLScriptElement | null = null;
    if (js) {
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
      <MarketingNav current={current} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
