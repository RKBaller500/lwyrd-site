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
  if (body.includes('class="mhero"')) return "/marketing-page-scripts/matching.js";
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

const responsiveMarketingOverrides = `
  @media (max-width: 900px) {
    header.nav .nav-inner { height: 64px; }
    header.nav .nav-menu-open .nav-links { top: 64px !important; }
  }

  @media (max-width: 680px) {
    :root { --pad: clamp(18px, 5.2vw, 24px); --sec: 58px; }
    .wrap { width: 100%; max-width: 100%; }
    .sec { padding-top: 58px; padding-bottom: 58px; }
    h1, h2, h3 { overflow-wrap: anywhere; }
    .btn { min-height: 44px; }
    .mhero { overflow: hidden; }
    .mhero-grid {
      min-height: 0 !important;
      padding: 54px var(--pad) 38px !important;
      gap: 28px !important;
    }
    .mhero h1 {
      max-width: 11.5ch !important;
      font-size: clamp(2.25rem, 13vw, 3.15rem) !important;
      line-height: 1.08 !important;
      margin-bottom: 1rem !important;
    }
    .mhero .hsub {
      max-width: 100% !important;
      font-size: 1rem !important;
      line-height: 1.62 !important;
      margin-bottom: 1.45rem !important;
    }
    .mhero .hactions .btn,
    .vs-close .btn {
      width: auto;
      max-width: 100%;
      justify-content: center;
    }
    .beamfig {
      max-width: min(360px, 92vw) !important;
      margin: 6px auto 0 !important;
      transform: none !important;
    }
    .bf-card {
      right: 0 !important;
      width: min(220px, 68%) !important;
    }
    .mflow {
      gap: 46px !important;
      margin-top: 34px !important;
    }
    .mstep {
      gap: 18px !important;
    }
    .mstep-copy {
      max-width: 100% !important;
    }
    .mstep-copy h3 {
      font-size: clamp(1.35rem, 8vw, 1.75rem) !important;
    }
    .mstep-copy p,
    .sec-lead p {
      font-size: 0.96rem !important;
      line-height: 1.62 !important;
    }
    .mwin {
      border-radius: 14px !important;
      width: 100%;
    }
    .mwin-url {
      max-width: 62vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .mwin-body {
      padding: 14px !important;
    }
    .mi-opt,
    .mm-card,
    .mf-draft,
    .know-attrs li,
    .alt {
      min-width: 0;
    }
    .mi-opt {
      align-items: flex-start !important;
    }
    .mm-head,
    .mf-hero {
      display: grid !important;
      grid-template-columns: 1fr auto;
      gap: 12px !important;
      align-items: start !important;
    }
    .mm-identity {
      min-width: 0;
    }
    .mm-ring,
    .mf-score {
      transform: scale(.88);
      transform-origin: top right;
    }
    .mm-meta {
      gap: 6px !important;
    }
    .mm-meta span,
    .mm-badge,
    .mm-rank {
      white-space: normal !important;
    }
    .mf-actions {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
    }
    .mf-btn {
      min-height: 40px;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .vs-close {
      display: grid !important;
      gap: 18px !important;
      text-align: left !important;
    }
    .vs-close h2 {
      font-size: clamp(1.8rem, 10vw, 2.35rem) !important;
    }
    .book-page {
      padding: 16px 0 38px !important;
    }
    .book-card {
      border-radius: 18px !important;
      min-height: 0 !important;
      box-shadow: 0 8px 28px rgba(0,43,85,.10) !important;
    }
    .bk-info {
      border-radius: 0 !important;
      min-height: 0 !important;
    }
    .bk-info h1 {
      max-width: 12ch;
    }
    .bk-main-live,
    .bk-live-empty,
    .bk-live-frame {
      min-height: 0 !important;
    }
    .bk-live-frame {
      height: min(680px, 78vh) !important;
    }
  }
`;

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
      const clientRoutes: Record<string, string> = {
        Startups: "/clients/startups",
        SMBs: "/clients/smbs",
        Individuals: "/clients/individuals",
      };

      if (href === "#" && legalRoutes[label]) {
        e.preventDefault();
        e.stopPropagation();
        router.push(legalRoutes[label]);
        return;
      }

      if (href === "#" && clientRoutes[label]) {
        e.preventDefault();
        e.stopPropagation();
        router.push(clientRoutes[label]);
        return;
      }

      if (!isGetMatched) return;
      e.preventDefault();
      e.stopPropagation();
      // If the hero track selector has a choice, deep-link straight into that
      // track's intake (the wizard reads ?track= and skips to the next
      // question). Otherwise fall back to the orientation step.
      let dest = "/intake/start";
      const trackSelect = root.querySelector<HTMLSelectElement>("#trackSelect");
      const selectedTrack = trackSelect?.value.trim();
      if (selectedTrack) {
        const trackMap: Record<string, string> = {
          startup: "startup",
          "small-business": "small_business",
          individual: "individual",
        };
        const mapped = trackMap[selectedTrack];
        if (mapped) dest = `/intake?track=${mapped}`;
      }
      if (isAuthenticated) router.push(dest);
      else {
        const signup = href.includes("tab=signup");
        openModal(signup ? "signup" : "login", dest);
      }
    };
    root.addEventListener("click", onClick, true);
    return () => {
      root.removeEventListener("click", onClick, true);
    };
  }, [body, isAuthenticated, openModal, router]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !onReady) return;
    return onReady(root);
  }, [body, onReady]);

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
      if (!root.querySelector(".rv, .rv-seq, #heroMaze, #calGrid, #bkMain, [data-seg], .qa, form, input, select")) return;
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

    return () => {
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("load", runOriginalJs);
      observer?.disconnect();
      if (scriptEl) scriptEl.remove();
    };
  }, [body, js, authReady]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            // Design display/body fonts (the original <head> link was stripped).
            "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600&family=Libre+Baskerville:wght@400;700&display=swap');\n" +
            css +
            "\n" +
            responsiveMarketingOverrides +
            /* keep the dark root overlay off marketing pages */
            "\n#ambient-overlay{display:none !important;}\n",
        }}
      />
      <MarketingNav current={current} currentItem={currentItem} />
      <MarketingBodyMarkup ref={ref} body={body} />
    </>
  );
}
