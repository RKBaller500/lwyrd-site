"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import "./marketing-nav.css";

type Section = "product" | "clients" | "law-firms" | "about" | "blog" | "help";

/**
 * Marketing navigation — a faithful React reproduction of the new design's
 * <header class="nav"> so the design CSS styles it exactly. Scroll state and
 * the mobile toggle are React-managed (the embedded page JS for these was
 * stripped by the generator). Auth-dependent CTAs are wired to the existing
 * auth/routing implementation.
 */
export default function MarketingNav({ current }: { current?: Section }) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setOpen(false);

  const getMatched = () => {
    closeMobile();
    router.push(isAuthenticated ? "/intake/start" : "/get-matched");
  };

  const cur = (s: Section) => (current === s ? " is-current" : "");
  const aria = (s: Section) =>
    current === s ? ({ "aria-current": "page" } as const) : {};

  return (
    <header
      className={`nav${scrolled ? " scrolled" : ""}${open ? " nav-menu-open" : ""}`}
      id="nav"
    >
      <div className="wrap nav-inner">
        <Link href="/" className="brand" aria-label="LWYRD home" onClick={closeMobile}>
          <Image
            src="/marketing/Logos/LWYRD_Navy.png"
            alt="LWYRD"
            width={120}
            height={22}
            className="brand-logo"
            priority
          />
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <div className="nav-item">
            <button className={`nav-trigger${cur("product")}`} type="button">
              Product
            </button>
            <div className="nav-menu" aria-label="Product menu">
              <Link href="/product/matching" onClick={closeMobile} {...aria("product")}>
                Matching
              </Link>
              <Link href="/product/consultations" onClick={closeMobile}>
                Consultations
              </Link>
              <a href="#" aria-disabled="true" className="soon-disabled" tabIndex={-1}>
                LWYRD Chatbot <span className="nav-pill">Soon</span>
              </a>
            </div>
          </div>

          <div className="nav-item">
            <button className={`nav-trigger${cur("clients")}`} type="button">
              Clients
            </button>
            <div className="nav-menu" aria-label="Clients menu">
              <a href="#" aria-disabled="true">Startups</a>
              <a href="#" aria-disabled="true">SMBs</a>
              <a href="#" aria-disabled="true">Individuals</a>
            </div>
          </div>

          <div className="nav-item">
            <Link
              href="/for-law-firms"
              className={`nav-trigger${cur("law-firms")}`}
              onClick={closeMobile}
              {...aria("law-firms")}
            >
              Law Firms
            </Link>
          </div>

          <div className="nav-item">
            <Link
              href="/about"
              className={`nav-trigger${cur("about")}`}
              onClick={closeMobile}
              {...aria("about")}
            >
              About Us
            </Link>
          </div>

          <div className="nav-item">
            <Link
              href="/blog"
              className={`nav-trigger${cur("blog")}`}
              onClick={closeMobile}
              {...aria("blog")}
            >
              Blog
            </Link>
          </div>

          <div className="nav-item">
            <button className={`nav-trigger${cur("help")}`} type="button">
              Help Center
            </button>
            <div className="nav-menu" aria-label="Help Center menu">
              <Link href="/faq" onClick={closeMobile}>FAQ</Link>
              <Link href="/contact" onClick={closeMobile}>Contact</Link>
            </div>
          </div>
        </nav>

        <div className="nav-cta">
          {isAuthenticated && user ? (
            <>
              <Link
                href="/dashboard"
                className="btn btn-ghost"
                onClick={closeMobile}
              >
                Dashboard
              </Link>
              <Link
                href="/account"
                className="nav-avatar"
                aria-label="Your profile"
                onClick={closeMobile}
                title={user.name}
              >
                {(user.name || "?").trim().charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/get-matched?tab=login"
                className="btn btn-ghost"
                onClick={closeMobile}
              >
                Sign in
              </Link>
              <button type="button" className="btn btn-primary" onClick={getMatched}>
                Get matched
              </button>
            </>
          )}
          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
