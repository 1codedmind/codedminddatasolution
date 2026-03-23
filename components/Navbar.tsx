"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Database } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "About", href: "/#why-us" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/#cta" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <div className="hidden md:block">
            <Link
              href="/#cta"
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors shadow-sm shadow-amber-200/70"
            >
              Book a Consultation
            </Link>
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
          <Link
            href="/#cta"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-colors"
          >
            Book a Consultation
          </Link>
        </div>
      )}
    </header>
  );
}
