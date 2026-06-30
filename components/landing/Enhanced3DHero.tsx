"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Database, Code2, FileText, Layers } from "lucide-react";

const CARDS = [
  {
    Icon: Database,
    title: "Data Engineering",
    desc: "ETL pipelines on Snowflake, Databricks, AWS & GCP",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.18)",
    border: "rgba(245,158,11,0.25)",
    href: "/services",
    cta: "View services",
  },
  {
    Icon: Code2,
    title: "Developer Tools",
    desc: "JSON, Base64, UUID, timestamps, passwords & more",
    color: "#10B981",
    glow: "rgba(16,185,129,0.18)",
    border: "rgba(16,185,129,0.25)",
    href: "/tools",
    cta: "Try for free",
  },
  {
    Icon: FileText,
    title: "Resume Builder",
    desc: "ATS-optimized PDFs with 12 live-preview templates",
    color: "#3B82F6",
    glow: "rgba(59,130,246,0.18)",
    border: "rgba(59,130,246,0.25)",
    href: "/tools/resume-builder",
    cta: "Build resume",
  },
  {
    Icon: Layers,
    title: "PDF Tools",
    desc: "Merge, split, convert and work with PDFs in-browser",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.18)",
    border: "rgba(139,92,246,0.25)",
    href: "/tools",
    cta: "Open tools",
  },
];

function Card3D({ card, index }: { card: (typeof CARDS)[0]; index: number }) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-60, 60], [14, -14]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(rawX, [-60, 60], [-14, 14]), { stiffness: 200, damping: 20 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 + index * 0.1, duration: 0.55 }}
      style={{ perspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rawX.set(e.clientX - r.left - r.width / 2);
        rawY.set(e.clientY - r.top - r.height / 2);
      }}
      onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: `0 0 0 1px ${card.border}, 0 20px 60px rgba(0,0,0,0.3)`,
        }}
        whileHover={{ scale: 1.04, boxShadow: `0 0 0 1px ${card.border}, 0 30px 80px rgba(0,0,0,0.4), 0 0 40px ${card.glow}` }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-sm cursor-pointer h-full"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5"
          style={{ background: card.glow, border: `1px solid ${card.border}` }}
        >
          <card.Icon size={22} style={{ color: card.color }} />
        </div>
        <h3 className="font-bold text-white text-sm mb-1.5">{card.title}</h3>
        <p className="text-xs text-stone-400 leading-relaxed mb-3">{card.desc}</p>
        <Link
          href={card.href}
          className="inline-flex items-center gap-1 text-xs font-semibold hover:gap-2 transition-all"
          style={{ color: card.color }}
        >
          {card.cta} <ArrowRight size={11} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function Enhanced3DHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)", top: "-20%", left: "-15%" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)", bottom: "-20%", right: "-10%" }}
          animate={{ x: [0, -40, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)", top: "35%", left: "55%" }}
          animate={{ x: [0, 25, -15, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold text-amber-400 border border-amber-400/25 bg-amber-400/10 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Data Engineering · Free Developer Tools
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight text-center leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Enterprise data solutions
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">
            & free tools for developers
          </span>
        </motion.h1>

        <motion.p
          className="text-lg text-stone-400 text-center max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          We architect data pipelines on Snowflake, Databricks and AWS —
          and ship free browser tools that thousands of developers use every day.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-white rounded-xl transition-all"
              style={{
                background: "linear-gradient(135deg, #d97706, #dc2626)",
                boxShadow: "0 20px 40px rgba(217,119,6,0.25)",
              }}
            >
              Explore data services <ArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold text-stone-300 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Try free tools <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* 3D Service Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CARDS.map((card, i) => (
            <Card3D key={card.title} card={card} index={i} />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-stone-500 tracking-widest uppercase">scroll</span>
          <div className="w-5 h-8 rounded-full border border-stone-600 flex items-start justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 rounded-full bg-stone-400"
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
