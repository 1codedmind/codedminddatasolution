"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown, CircleUserRound, LayoutDashboard, FileUser, ClipboardList, Braces, Globe, Files } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import LogoutButton from "@/components/auth/LogoutButton";

const toolsMenu = [
  { href: "/tools",                    label: "Developer Tools",    desc: "JSON, UUID, Base64 & more", icon: Braces },
  { href: "/tools/timezone-converter", label: "Timezone Converter", desc: "500+ IANA timezones",       icon: Globe  },
  { href: "/tools/pdf",                label: "PDF Tools",          desc: "Merge, split, rotate & convert", icon: Files },
];

const navLinks = [
  { label: "Services",  href: "/#services"  },
  { label: "Solutions", href: "/#solutions" },
  { label: "Careers",   href: "/careers"    },
];


export default function Navbar({ sessionEmail, sessionRole }: { sessionEmail?: string; sessionRole?: string }) {
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [toolsOpen,   setToolsOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const toolsRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (toolsRef.current   && !toolsRef.current.contains(e.target as Node))   setToolsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.15 }}>
              <svg width="26" height="26" viewBox="0 0 180 180" fill="none" aria-hidden="true">
                <polygon points="90,8 125,43 90,78 55,43"      stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="90,102 125,137 90,172 55,137"  stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="8,90 43,55 78,90 43,125"       stroke="#1c1917" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="102,90 137,55 172,90 137,125"  stroke="#1c1917" strokeWidth="14" strokeLinejoin="miter"/>
              </svg>
            </motion.div>
            <span className="text-[14px] font-bold tracking-tight">
              <span className="text-stone-900">CODED</span><span className="text-[#C87660]"> MIND</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">

            {/* Tools dropdown */}
            <div ref={toolsRef} className="relative">
              <button
                onClick={() => setToolsOpen((p) => !p)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${toolsOpen ? "text-stone-950 bg-stone-100" : "text-stone-500 hover:text-stone-950 hover:bg-stone-50"}`}
              >
                Tools
                <motion.span animate={{ rotate: toolsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} />
                </motion.span>
              </button>

              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{    opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-1 w-64 bg-white border border-stone-200 rounded-xl shadow-lg shadow-stone-200/60 p-1.5 z-50"
                  >
                    {toolsMenu.map(({ href, label, desc, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setToolsOpen(false)}
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-stone-50 transition group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-950 group-hover:bg-amber-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-150">
                          <Icon size={13} className="text-white" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-stone-800">{label}</p>
                          <p className="text-[11px] text-stone-400 mt-0.5">{desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-3 py-2 text-sm font-medium text-stone-500 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {sessionEmail ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <CircleUserRound size={14} />
                  Profile
                  <motion.span animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{    opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-1 w-60 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-50"
                    >
                      <div className="px-3 py-2.5 mb-1">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Signed in as</p>
                        <p className="text-sm font-medium text-stone-800 truncate mt-0.5">{sessionEmail}</p>
                      </div>
                      <div className="space-y-0.5">
                        {(sessionRole && sessionRole !== "candidate" ? [
                          { href: "/hrms",        icon: LayoutDashboard, label: "HRMS Portal"     },
                          { href: "/admin",       icon: LayoutDashboard, label: "Admin Dashboard" },
                          { href: "/admin/leads", icon: FileUser,        label: "Leads"           },
                        ] : [
                          { href: "/candidate",         icon: LayoutDashboard, label: "Dashboard"   },
                          { href: "/candidate/profile", icon: FileUser,        label: "Profile"     },
                          { href: "/assessments",       icon: ClipboardList,   label: "Assessments" },
                        ]).map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors">
                            <Icon size={14} className="text-stone-400" /> {label}
                          </Link>
                        ))}
                      </div>
                      <div className="mt-1 pt-1 border-t border-stone-100">
                        <LogoutButton className="flex w-full items-center justify-center px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-lg transition-colors" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors">Log in</Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/#cta" className="px-3.5 py-1.5 text-sm font-semibold text-white bg-stone-950 rounded-lg hover:bg-stone-800 transition-colors">
                    Get in touch
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate:  90,  scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-stone-200 bg-white overflow-hidden"
          >
            <div className="px-4 pt-3 pb-5">
              <div className="space-y-0.5 mb-4">
                <p className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Tools</p>
                {toolsMenu.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg transition-colors">{label}
                  </Link>
                ))}
                <div className="my-1.5 border-t border-stone-100" />
                {navLinks.map(({ label, href }) => (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 rounded-lg transition-colors">{label}
                  </Link>
                ))}
              </div>
              {sessionEmail ? (
                <div className="space-y-2">
                  <Link href={sessionRole && sessionRole !== "candidate" ? "/hrms" : "/candidate"} onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors">
                    <CircleUserRound size={14} /> {sessionRole && sessionRole !== "candidate" ? "HRMS" : "Dashboard"}
                  </Link>
                  <LogoutButton className="w-full py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center py-2.5 text-sm font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Log in</Link>
                  <Link href="/#cta" onClick={() => setMobileOpen(false)} className="flex items-center justify-center py-2.5 text-sm font-semibold text-white bg-stone-950 rounded-xl hover:bg-stone-800 transition-colors">Get in touch</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
