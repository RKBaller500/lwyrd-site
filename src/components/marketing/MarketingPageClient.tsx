"use client";

import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";
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
type NavItem = "matching" | "consultations" | "faq" | "contact";

function getMarketingScriptSrc(body: string) {
  if (body.includes('id="heroMaze"')) return "/marketing-page-scripts/home.js";
  if (body.includes('id="trkSel"')) return "/marketing-page-scripts/matching.js";
  if (body.includes('id="calGrid"')) return "/marketing-page-scripts/consultations.js";
  if (body.includes('id="blogSearch"')) return "/marketing-page-scripts/blog.js";
  if (body.includes('class="faq-list"')) return "/marketing-page-scripts/faq.js";
  if (body.includes('class="contact-form"')) return "/marketing-page-scripts/contact.js";
  return null;
}

const MarketingBodyMarkup = memo(
  forwardRef<HTMLDivElement, { body: string }>(function MarketingBodyMarkup(
    { body },
    ref
  ) {
    const html = useMemo(() => ({ __html: body }), [body]);
    return <div ref={ref} dangerouslySetInnerHTML={html} />;
  })
);

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
  currentItem,
  onReady,
}: {
  css: string;
  body: string;
  js: string;
  current?: Section;
  currentItem?: NavItem;
  onReady?: (root: HTMLElement) => void | (() => void);
}) {
  const ref = useRef<HTMLDivElement>(null);
  const initedRef = useRef(false);
  const initializedBodyRef = useRef<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const { isAuthenticated, isLoading, openModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const timer = window.setTimeout(() => setAuthReady(true), 0);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

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
    // Wait for the initial Supabase session check before running the ported
    // scripts. Later auth UI changes should not restart the raw HTML subtree:
    // the memoized MarketingBodyMarkup keeps React from wiping script-owned
    // DOM mutations such as the maze SVG and reveal classes.
    if (!authReady) return;
    if (initializedBodyRef.current !== body) {
      initializedBodyRef.current = body;
      initedRef.current = false;
    }
    let cleanup: void | (() => void);

    // Run the page's original JS (maze, reveals, accordions, smooth scroll).
    // Load it as a first-party external script so direct URL loads and client
    // transitions both run the exact generated animation code under CSP.
    const timers: number[] = [];
    const frames: number[] = [];
    let scriptEl: HTMLScriptElement | null = null;
    let ran = false; // once per effect invocation (not a persistent DOM flag)
    const scriptSrc = getMarketingScriptSrc(body);

    const runOriginalJs = () => {
      if (ran || !js || !scriptSrc) return;
      if (!root.querySelector(".rv, .rv-seq, #heroMaze, [data-seg], .qa, form, input, select")) return;
      ran = true;
      // On a RE-init, reset the body to pristine markup first. The original
      // scripts append DOM and bind element-level listeners without cleanup, so
      // re-running over a half-initialised DOM would stack mazes and double-bind
      // handlers. Rebuilding the nodes detaches old listeners with old nodes.
      // Skipped on first init since the hydrated DOM is pristine.
      if (initedRef.current) {
        root.innerHTML = body;
      }
      initedRef.current = true;
      scriptEl = document.createElement("script");
      scriptEl.src = scriptSrc;
      scriptEl.async = false;
      document.body.appendChild(scriptEl);
    };

    frames.push(window.requestAnimationFrame(runOriginalJs));
    timers.push(window.setTimeout(runOriginalJs, 50));
    timers.push(window.setTimeout(runOriginalJs, 250));
    if (document.readyState === "complete") runOriginalJs();
    else window.addEventListener("load", runOriginalJs, { once: true });

    let observer: MutationObserver | null = null;
    if ("MutationObserver" in window) {
      observer = new MutationObserver(() => {
        frames.push(window.requestAnimationFrame(runOriginalJs));
      });
      observer.observe(root, { childList: true, subtree: true });
    }

    if (onReady) cleanup = onReady(root);

    return () => {
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("load", runOriginalJs);
      observer?.disconnect();
      if (typeof cleanup === "function") cleanup();
      if (scriptEl) scriptEl.remove();
    };
    // Re-run only when the page content changes or the initial auth hydrate
    // settles. Auth transitions re-render the nav, but the raw page markup and
    // its animations should keep their current DOM state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body, js, authReady]);

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
      <MarketingNav current={current} currentItem={currentItem} />
      <MarketingBodyMarkup ref={ref} body={body} />
    </>
  );
}
