"use client";

import { useEffect, useRef } from "react";
import MarketingNav from "./MarketingNav";

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

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let cleanup: void | (() => void);

    // Run the page's original JS (maze, reveals, accordions, smooth scroll).
    if (js) {
      try {
        new Function(js)();
      } catch (err) {
        console.error("Marketing page script error:", err);
      }
    }

    if (onReady) cleanup = onReady(root);

    return () => {
      if (typeof cleanup === "function") cleanup();
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
            '\nbody > div[aria-hidden="true"]{display:none !important;}\n',
        }}
      />
      <MarketingNav current={current} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
