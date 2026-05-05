"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ChevronDown,
  Building2,
  Users,
  ClipboardList,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import LwyrdLogo from "@/components/ui/LwyrdLogo";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="hidden sm:block text-sm text-slate-600 px-3 py-2 rounded-xl hover:bg-[#002452]/8 hover:text-[#002452] active:bg-[#002452]/15 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block text-base text-slate-700 px-2 py-3 border-b border-[#ddd7cc]/60 hover:text-[#002452] transition-colors last:border-0"
    >
      {children}
    </Link>
  );
}

function Dropdown({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-xl hover:bg-[#002452]/8 hover:text-[#002452] transition-colors"
      >
        {label}
        <ChevronDown size={13} strokeWidth={2} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="bg-[#fbfaf6] border border-[#ddd7cc] rounded-2xl shadow-lg overflow-hidden min-w-[180px]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  href,
  onClick,
  icon: Icon,
  danger,
  children,
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ElementType;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const cls = `flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm transition-colors ${
    danger
      ? "text-slate-500 hover:bg-red-50 hover:text-red-600"
      : "text-slate-600 hover:bg-[#002452]/6 hover:text-[#002452]"
  }`;
  const inner = (
    <>
      {Icon && <Icon size={14} strokeWidth={1.5} />}
      {children}
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

function DropdownDivider() {
  return <div className="border-t border-[#ddd7cc]" />;
}

export default function Navbar() {
  const { isAuthenticated, user, logout, openModal } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isFirm = user?.role === "firm";
  const close = () => setMobileOpen(false);

  const handleGetMatched = (fromMobile = false) => {
    if (fromMobile) close();
    if (isAuthenticated) {
      router.push("/intake/start");
    } else {
      openModal("login", "/intake/start");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#f5f4f0]/95 backdrop-blur-md shadow-sm border-[#ddd7cc]/60"
          : "bg-[#f5f4f0] border-[#ddd7cc]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center" onClick={close}>
          <LwyrdLogo variant="navy" className="h-8 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {isAuthenticated && user ? (
            isFirm ? (
              <>
                <NavLink href="/portal">Firm Portal</NavLink>
                {user.isAdmin && <NavLink href="/admin">Admin</NavLink>}
                <Dropdown label={<span className="flex items-center gap-1.5"><Building2 size={14} strokeWidth={1.5} />{user.name}</span>}>
                  <DropdownItem href="/portal" icon={Briefcase}>Firm Profile</DropdownItem>
                  <DropdownItem href="/portal#clients" icon={Users}>Matched Clients</DropdownItem>
                  <DropdownItem href="/portal#assessment" icon={ClipboardList}>Assessment Status</DropdownItem>
                  <DropdownItem href="/account" icon={Settings}>Settings</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={() => logout()} danger icon={LogOut}>Sign out</DropdownItem>
                </Dropdown>
              </>
            ) : (
              <>
                <NavLink href="/dashboard">My Dashboard</NavLink>
                <button
                  onClick={() => handleGetMatched()}
                  className="hidden sm:block text-sm text-slate-600 px-3 py-2 rounded-xl hover:bg-[#002452]/8 hover:text-[#002452] active:bg-[#002452]/15 transition-colors"
                >
                  Get Matched
                </button>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-sm text-slate-600 px-3 py-2 rounded-xl hover:bg-[#002452]/8 hover:text-[#002452] transition-colors"
                  >
                    <LayoutDashboard size={15} strokeWidth={1.5} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Dropdown label={<span className="flex items-center gap-1.5"><User size={14} strokeWidth={1.5} />{user.name}</span>}>
                  <DropdownItem href="/account" icon={User}>Profile</DropdownItem>
                  <DropdownItem href="/account" icon={Settings}>Settings</DropdownItem>
                  <DropdownItem href="/contact" icon={HelpCircle}>Support</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={() => logout()} danger icon={LogOut}>Sign out</DropdownItem>
                </Dropdown>
              </>
            )
          ) : (
            <>
              <NavLink href="/how-it-works">How It Works</NavLink>
              <NavLink href="/for-law-firms">For Law Firms</NavLink>
              <NavLink href="/faq">FAQ</NavLink>
              <NavLink href="/about">About</NavLink>
              <button
                onClick={() => openModal("login")}
                className="text-sm text-slate-600 px-3 py-2 rounded-xl hover:bg-[#002452]/8 hover:text-[#002452] active:bg-[#002452]/15 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleGetMatched()}
                className="bg-[#002452] text-white text-sm px-5 py-2 rounded-full hover:bg-[#002452]/85 active:bg-[#002452]/70 transition-colors ml-1"
              >
                Get Matched
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-[#002452]/8 hover:text-[#002452] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden border-t border-[#ddd7cc] bg-[#f5f4f0]"
          >
            <div className="px-6 py-4">
              {isAuthenticated && user ? (
                isFirm ? (
                  <>
                    <MobileNavLink href="/portal" onClick={close}>Firm Portal</MobileNavLink>
                    {user.isAdmin && <MobileNavLink href="/admin" onClick={close}>Admin</MobileNavLink>}
                    <MobileNavLink href="/portal" onClick={close}>Firm Profile</MobileNavLink>
                    <MobileNavLink href="/portal#clients" onClick={close}>Matched Clients</MobileNavLink>
                    <MobileNavLink href="/portal#assessment" onClick={close}>Assessment Status</MobileNavLink>
                    <MobileNavLink href="/account" onClick={close}>Settings</MobileNavLink>
                    <button
                      onClick={() => { close(); logout(); }}
                      className="block w-full text-left text-base text-red-500 px-2 py-3 hover:text-red-600 transition-colors mt-1"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/dashboard" onClick={close}>My Dashboard</MobileNavLink>
                    <button
                      onClick={() => handleGetMatched(true)}
                      className="block w-full text-left text-base text-slate-700 px-2 py-3 border-b border-[#ddd7cc]/60 hover:text-[#002452] transition-colors"
                    >
                      Get Matched
                    </button>
                    {user.isAdmin && <MobileNavLink href="/admin" onClick={close}>Admin</MobileNavLink>}
                    <MobileNavLink href="/account" onClick={close}>Profile & Settings</MobileNavLink>
                    <MobileNavLink href="/contact" onClick={close}>Support</MobileNavLink>
                    <button
                      onClick={() => { close(); logout(); }}
                      className="block w-full text-left text-base text-red-500 px-2 py-3 hover:text-red-600 transition-colors mt-1"
                    >
                      Sign out
                    </button>
                  </>
                )
              ) : (
                <>
                  <MobileNavLink href="/how-it-works" onClick={close}>How It Works</MobileNavLink>
                  <MobileNavLink href="/for-law-firms" onClick={close}>For Law Firms</MobileNavLink>
                  <MobileNavLink href="/faq" onClick={close}>FAQ</MobileNavLink>
                  <MobileNavLink href="/about" onClick={close}>About</MobileNavLink>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => { close(); openModal("login"); }}
                      className="w-full text-center text-sm text-slate-600 px-4 py-2.5 rounded-xl border border-[#ddd7cc] hover:bg-[#002452]/8 hover:text-[#002452] transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleGetMatched(true)}
                      className="w-full text-center bg-[#002452] text-white text-sm px-4 py-2.5 rounded-full hover:bg-[#002452]/85 transition-colors"
                    >
                      Get Matched
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
