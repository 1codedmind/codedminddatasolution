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
  { label: "Tools", href: "/tools" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "About", href: "/#why-us" },
  { label: "Careers", href: "/careers" },
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
    <header className="sticky top-0 z-50 bg-[#fcfaf6]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-600">
              <Database size={15} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-stone-900 tracking-tight">
              Coded Mind <span className="text-amber-700">Data Solution</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-stone-500 hover:text-stone-950 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((c) => !c)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition"
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                >
                  <CircleUserRound size={15} />
                  Profile
                  <ChevronDown size={14} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full z-20 w-64 pt-2">
                    <div className="rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 p-2">
                      <div className="rounded-lg bg-stone-50 px-4 py-3 mb-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
                          Signed in as
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-stone-700">
                          {sessionEmail}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <Link href="/candidate" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
                          <LayoutDashboard size={15} className="text-stone-400" />
                          Dashboard
                        </Link>
                        <Link href="/candidate/profile" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
                          <FileUser size={15} className="text-stone-400" />
                          Profile Details
                        </Link>
                        <Link href="/assessments" className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition">
                          <ClipboardList size={15} className="text-stone-400" />
                          Assessments
                        </Link>
                      </div>
                      <div className="mt-1 pt-1 border-t border-stone-100">
                        <LogoutButton className="flex w-full items-center justify-center rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition disabled:opacity-60" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-950 transition px-2 py-2">
                  Log In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-950 hover:bg-stone-100 transition"
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
                className="px-3 py-2.5 text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <p className="text-center text-xs text-stone-400 px-2">{sessionEmail}</p>
              <Link href="/candidate" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
                <CircleUserRound size={15} /> Dashboard
              </Link>
              <Link href="/candidate/profile" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50 transition">
                <FileUser size={15} /> Profile Details
              </Link>
              <Link href="/assessments" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50 transition">
                <ClipboardList size={15} /> Assessments
              </Link>
              <LogoutButton className="flex items-center justify-center w-full rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition disabled:opacity-60" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50 transition">
                Log In
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
