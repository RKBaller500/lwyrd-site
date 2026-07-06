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
      className="hidden sm:block text-sm text-[#C8CDD8] px-3 py-2 rounded-xl hover:text-[#E6EAF2] hover:bg-[#1F2A3D] active:bg-[#1F2A3D]/70 transition-colors"
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
      className="block text-base text-[#C8CDD8] px-2 py-3 border-b border-[#1F2A3D] hover:text-[#E6EAF2] transition-colors last:border-0"
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
        className="flex items-center gap-1.5 text-sm text-[#C8CDD8] px-3 py-2 rounded-xl hover:text-[#E6EAF2] hover:bg-[#1F2A3D] transition-colors"
      >
        {label}
        <ChevronDown size={13} strokeWidth={2} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="bg-[#141C2E] border border-[#1F2A3D] rounded-2xl shadow-xl overflow-hidden min-w-[180px]">
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
      ? "text-[#C8CDD8] hover:bg-rose-500/10 hover:text-rose-400"
      : "text-[#C8CDD8] hover:bg-[#1F2A3D] hover:text-[#E6EAF2]"
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
  return <div className="border-t border-[#1F2A3D]" />;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
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
    router.push(isAuthenticated ? "/intake/start" : "/get-matched");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0F1C]/95 backdrop-blur-md shadow-sm border-[#1F2A3D]"
          : "bg-[#0A0F1C] border-[#1F2A3D]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center">

        {/* LEFT, logo */}
        <div className="w-36 shrink-0">
          <Link href="/" onClick={close}>
            <LwyrdLogo variant="white" className="h-9 w-auto" priority />
          </Link>
        </div>

        {/* CENTER, nav links */}
        <div className="flex-1 hidden sm:flex items-center justify-center gap-1">
          {isAuthenticated && user ? (
            isFirm ? (
              <>
                <NavLink href="/portal">Firm Portal</NavLink>
                <NavLink href="/blog">Blog</NavLink>
                {user.isAdmin && <NavLink href="/admin">Admin</NavLink>}
              </>
            ) : (
              <>
                <NavLink href="/how-it-works">How It Works</NavLink>
                <NavLink href="/blog">Blog</NavLink>
                <NavLink href="/faq">FAQ</NavLink>
                <NavLink href="/about">About</NavLink>
                <button
                  onClick={() => handleGetMatched()}
                  className="hidden sm:block text-sm text-[#C8CDD8] px-3 py-2 rounded-xl hover:text-[#E6EAF2] hover:bg-[#1F2A3D] transition-colors"
                >
                  Get Matched
                </button>
              </>
            )
          ) : (
            <>
              <NavLink href="/how-it-works">How It Works</NavLink>
              <NavLink href="/for-law-firms">For Law Firms</NavLink>
              <NavLink href="/blog">Blog</NavLink>
              <NavLink href="/faq">FAQ</NavLink>
              <NavLink href="/about">About</NavLink>
            </>
          )}
        </div>

        {/* RIGHT, actions */}
        <div className="w-36 shrink-0 hidden sm:flex items-center justify-end gap-2">
          {isAuthenticated && user ? (
            isFirm ? (
              <Dropdown label={<span className="flex items-center gap-1.5"><Building2 size={14} strokeWidth={1.5} />{user.name}</span>}>
                <DropdownItem href="/portal" icon={Briefcase}>Firm Profile</DropdownItem>
                <DropdownItem href="/portal#clients" icon={Users}>Matched Clients</DropdownItem>
                <DropdownItem href="/portal" icon={ClipboardList}>Assessment Status</DropdownItem>
                <DropdownItem href="/account" icon={Settings}>Settings</DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => logout()} danger icon={LogOut}>Sign out</DropdownItem>
              </Dropdown>
            ) : (
              <>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-sm text-[#C8CDD8] px-3 py-2 rounded-xl hover:text-[#E6EAF2] hover:bg-[#1F2A3D] transition-colors"
                  >
                    <LayoutDashboard size={15} strokeWidth={1.5} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Dropdown label={<span className="flex items-center gap-1.5"><User size={14} strokeWidth={1.5} />{user.name}</span>}>
                  <DropdownItem href="/dashboard" icon={LayoutDashboard}>My Dashboard</DropdownItem>
                  <DropdownItem href="/account" icon={User}>Profile</DropdownItem>
                  <DropdownItem href="/contact" icon={HelpCircle}>Support</DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={() => logout()} danger icon={LogOut}>Sign out</DropdownItem>
                </Dropdown>
              </>
            )
          ) : (
            <button
              onClick={() => handleGetMatched()}
              className="bg-white hover:bg-[#E6EAF2] active:bg-[#C8CDD8] text-[#0A0F1C] text-sm px-5 py-2 rounded-full font-medium transition-colors"
            >
              Get Matched
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="sm:hidden ml-auto p-2 rounded-xl text-[#C8CDD8] hover:text-[#E6EAF2] hover:bg-[#1F2A3D] transition-colors"
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
            className="sm:hidden overflow-hidden border-t border-[#1F2A3D] bg-[#0A0F1C]"
          >
            <div className="px-6 py-4">
              {isAuthenticated && user ? (
                isFirm ? (
                  <>
                    <MobileNavLink href="/portal" onClick={close}>Firm Portal</MobileNavLink>
                    <MobileNavLink href="/blog" onClick={close}>Blog</MobileNavLink>
                    {user.isAdmin && <MobileNavLink href="/admin" onClick={close}>Admin</MobileNavLink>}
                    <MobileNavLink href="/portal" onClick={close}>Firm Profile</MobileNavLink>
                    <MobileNavLink href="/portal#clients" onClick={close}>Matched Clients</MobileNavLink>
                    <MobileNavLink href="/portal" onClick={close}>Assessment Status</MobileNavLink>
                    <MobileNavLink href="/account" onClick={close}>Settings</MobileNavLink>
                    <button
                      onClick={() => { close(); logout(); }}
                      className="block w-full text-left text-base text-rose-400 px-2 py-3 hover:text-rose-300 transition-colors mt-1"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/how-it-works" onClick={close}>How It Works</MobileNavLink>
                    <MobileNavLink href="/blog" onClick={close}>Blog</MobileNavLink>
                    <MobileNavLink href="/faq" onClick={close}>FAQ</MobileNavLink>
                    <MobileNavLink href="/about" onClick={close}>About</MobileNavLink>
                    <button
                      onClick={() => handleGetMatched(true)}
                      className="block w-full text-left text-base text-[#C8CDD8] px-2 py-3 border-b border-[#1F2A3D] hover:text-[#E6EAF2] transition-colors"
                    >
                      Get Matched
                    </button>
                    {user.isAdmin && <MobileNavLink href="/admin" onClick={close}>Admin</MobileNavLink>}
                    <MobileNavLink href="/dashboard" onClick={close}>My Dashboard</MobileNavLink>
                    <MobileNavLink href="/account" onClick={close}>Profile</MobileNavLink>
                    <MobileNavLink href="/contact" onClick={close}>Support</MobileNavLink>
                    <button
                      onClick={() => { close(); logout(); }}
                      className="block w-full text-left text-base text-rose-400 px-2 py-3 hover:text-rose-300 transition-colors mt-1"
                    >
                      Sign out
                    </button>
                  </>
                )
              ) : (
                <>
                  <MobileNavLink href="/how-it-works" onClick={close}>How It Works</MobileNavLink>
                  <MobileNavLink href="/for-law-firms" onClick={close}>For Law Firms</MobileNavLink>
                  <MobileNavLink href="/blog" onClick={close}>Blog</MobileNavLink>
                  <MobileNavLink href="/faq" onClick={close}>FAQ</MobileNavLink>
                  <MobileNavLink href="/about" onClick={close}>About</MobileNavLink>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => { close(); router.push("/get-matched?tab=login"); }}
                      className="w-full text-center text-sm text-[#C8CDD8] px-4 py-2.5 rounded-xl border border-[#1F2A3D] hover:text-[#E6EAF2] hover:bg-[#1F2A3D] transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleGetMatched(true)}
                      className="w-full text-center bg-white text-[#0A0F1C] text-sm px-4 py-2.5 rounded-full font-medium transition-colors"
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
