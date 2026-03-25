"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Database,
  CircleUserRound,
  ChevronDown,
  LayoutDashboard,
  FileUser,
  ClipboardList,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "About", href: "/#why-us" },
  { label: "Careers", href: "/careers" },
  { label: "Assessments", href: "/assessments" },
  { label: "Candidate Portal", href: "/candidate" },
  { label: "Contact", href: "/#cta" },
];

type NavbarProps = {
  sessionEmail?: string;
};

export default function Navbar({ sessionEmail }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(sessionEmail);

  return (
    <header className="sticky top-0 z-50 bg-[#fcfaf6]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-600 shadow-sm shadow-amber-200/70">
              <Database size={15} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">
              Coded Mind{" "}
              <span className="text-amber-700">Data Solution</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 shadow-sm shadow-amber-200/70"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <CircleUserRound size={16} />
                  Profile
                  <ChevronDown size={16} />
                </button>

                {profileMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 w-72 pt-3">
                    <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-2xl shadow-stone-900/10">
                      <div className="rounded-2xl bg-stone-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                          Signed in as
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-stone-700">
                          {sessionEmail}
                        </p>
                      </div>

                      <div className="mt-3 space-y-1">
                        <Link
                          href="/candidate"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
                        >
                          <LayoutDashboard size={16} />
                          Dashboard
                        </Link>
                      <Link
                        href="/candidate/profile"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
                      >
                        <FileUser size={16} />
                        Profile Details
                        </Link>
                        <Link
                          href="/assessments"
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
                        >
                          <ClipboardList size={16} />
                          Assessments
                        </Link>
                      </div>

                      <div className="mt-3 border-t border-stone-200 pt-3">
                        <LogoutButton className="flex w-full items-center justify-center rounded-2xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-950"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200/70"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#fcfaf6] border-t border-stone-200 px-4 pt-3 pb-5">
          <nav className="flex flex-col gap-0.5 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <p className="px-2 text-center text-sm font-medium text-stone-500">
                {sessionEmail}
              </p>
              <Link
                href="/candidate"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors"
              >
                <CircleUserRound size={16} />
                Dashboard
              </Link>
              <Link
                href="/candidate/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-full hover:border-stone-400 transition-colors"
              >
                <FileUser size={16} />
                Profile Details
              </Link>
              <Link
                href="/assessments"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-full hover:border-stone-400 transition-colors"
              >
                <ClipboardList size={16} />
                Assessments
              </Link>
              <LogoutButton className="flex items-center justify-center w-full rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-full hover:border-stone-400 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
