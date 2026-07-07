"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Settings, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import "./marketing-nav.css";

type Section = "product" | "clients" | "law-firms" | "about" | "blog" | "help";
type NavItem = "matching" | "consultations" | "faq" | "contact";

/**
 * Marketing navigation — a faithful React reproduction of the new design's
 * <header class="nav"> so the design CSS styles it exactly. Scroll state and
 * the mobile toggle are React-managed (the embedded page JS for these was
 * stripped by the generator). Auth-dependent CTAs are wired to the existing
 * auth/routing implementation.
 */
export default function MarketingNav({
  current,
  currentItem,
}: {
  current?: Section;
  currentItem?: NavItem;
}) {
  const { isAuthenticated, user, openModal, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the avatar dropdown on outside click or Escape.
  useEffect(() => {
    if (!avatarOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAvatarOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [avatarOpen]);

  const closeMobile = () => setOpen(false);
  const closeAvatar = () => setAvatarOpen(false);

  const getMatched = () => {
    closeMobile();
    if (isAuthenticated) router.push("/intake/start");
    else openModal("login", "/intake/start");
  };

  const signIn = () => {
    closeMobile();
    // Plain sign-in — no intake redirect. Only "Get matched" routes to intake.
    openModal("login");
  };

  const cur = (s: Section) => (current === s ? " is-current" : "");
  const aria = (s: Section) =>
    current === s ? ({ "aria-current": "page" } as const) : {};
  const itemAria = (item: NavItem) =>
    currentItem === item ? ({ "aria-current": "page" } as const) : {};
  const logoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    closeMobile();
    if (pathname !== "/") return;
    event.preventDefault();
    window.location.assign("/");
  };

  return (
    <header
      className={`nav${scrolled ? " scrolled" : ""}${open ? " nav-menu-open" : ""}`}
      id="nav"
    >
      <div className="wrap nav-inner">
        <Link href="/" className="brand" aria-label="LWYRD home" onClick={logoClick}>
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
              <Link href="/product/matching" onClick={closeMobile} {...itemAria("matching")}>
                Matching
              </Link>
              <Link href="/product/consultations" onClick={closeMobile} {...itemAria("consultations")}>
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
              <Link href="/clients/startups" onClick={closeMobile}>Startups</Link>
              <Link href="/clients/smbs" onClick={closeMobile}>SMBs</Link>
              <Link href="/clients/individuals" onClick={closeMobile}>Individuals</Link>
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
              <Link href="/faq" onClick={closeMobile} {...itemAria("faq")}>FAQ</Link>
              <Link href="/contact" onClick={closeMobile} {...itemAria("contact")}>Contact</Link>
            </div>
          </div>
        </nav>

        <div className="nav-cta">
          {isAuthenticated && user ? (
            <div className={`nav-avatar-wrap${avatarOpen ? " is-open" : ""}`} ref={avatarRef}>
              <button
                type="button"
                className="nav-avatar"
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={avatarOpen}
                title={user.name}
                onClick={() => setAvatarOpen((o) => !o)}
              >
                {(user.name || "?").trim().charAt(0).toUpperCase()}
              </button>
              <div className="nav-avatar-menu" role="menu" aria-label="Account menu">
                <div className="nav-avatar-head">
                  <div className="nm">{user.name || "Your account"}</div>
                  {user.email && <div className="em">{user.email}</div>}
                </div>
                <Link href="/dashboard" onClick={() => { closeAvatar(); closeMobile(); }} role="menuitem">
                  <LayoutDashboard size={15} strokeWidth={1.6} />
                  Dashboard
                </Link>
                <Link href="/account" onClick={() => { closeAvatar(); closeMobile(); }} role="menuitem">
                  <Settings size={15} strokeWidth={1.6} />
                  Account settings
                </Link>
                {user.isAdmin && (
                  <Link href="/admin" onClick={() => { closeAvatar(); closeMobile(); }} role="menuitem">
                    <Shield size={15} strokeWidth={1.6} />
                    Admin panel
                  </Link>
                )}
                <div className="nav-avatar-sep" />
                <button
                  type="button"
                  className="danger"
                  role="menuitem"
                  onClick={() => {
                    closeAvatar();
                    closeMobile();
                    logout();
                  }}
                >
                  <LogOut size={15} strokeWidth={1.6} />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={signIn}>
                Sign in
              </button>
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
