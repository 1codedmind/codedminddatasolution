"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Database, Code2, Sparkles,
  Workflow, Boxes, Timer, ShieldCheck, BarChart3,
  LayoutDashboard, Plug, KeyRound, Cloud, BookOpen,
  FileSearch, MessagesSquare, Cog, Gauge, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DataPipelineViz, StackViz, AIFlowViz } from "@/components/services/CapabilityVisuals";

const EASE = [0.16, 1, 0.3, 1] as const;

type Deliverable = { Icon: LucideIcon; title: string; body: string };

type Capability = {
  id: string;
  Icon: LucideIcon;
  label: string;
  title: string;
  lead: string;
  accent: string;
  Visual: (props: { accent: string }) => React.ReactElement;
  delivers: Deliverable[];
  stack: string[];
};

const CAPABILITIES: Capability[] = [
  {
    id: "data",
    Icon: Database,
    label: "Data Engineering",
    title: "Pipelines that run whether or not anyone is watching.",
    lead: "Ingestion, transformation, and delivery built to fail loudly and recover cleanly — not to look good in a demo and page you at 2am.",
    accent: "#F59E0B",
    Visual: DataPipelineViz,
    delivers: [
      { Icon: Workflow, title: "ETL & ELT pipelines", body: "Tested transformations with lineage you can trace end to end." },
      { Icon: Boxes, title: "Warehouse modelling", body: "Snowflake, BigQuery, Databricks, or Redshift — modelled for how you query." },
      { Icon: Timer, title: "Orchestration", body: "Airflow or Dagster, with retries, alerting, and backfills that actually work." },
      { Icon: ShieldCheck, title: "Quality gates", body: "Bad numbers stop at the door instead of reaching a board deck." },
      { Icon: BarChart3, title: "Reporting", body: "Power BI, Tableau, or Metabase, refreshed on a schedule you trust." },
    ],
    stack: ["Python", "SQL", "dbt", "Airflow", "Spark", "Kafka", "Snowflake", "BigQuery", "Databricks"],
  },
  {
    id: "software",
    Icon: Code2,
    label: "Full-Stack Development",
    title: "Applications your team chooses to use, not ones they tolerate.",
    lead: "Product engineering end to end — interface, API, database, deployment — by people who own what they ship rather than hand it over a wall.",
    accent: "#3B82F6",
    Visual: StackViz,
    delivers: [
      { Icon: LayoutDashboard, title: "Web apps & portals", body: "Internal tools, admin systems, and customer-facing products." },
      { Icon: Plug, title: "APIs & integrations", body: "Connecting the systems you already depend on, without brittle glue." },
      { Icon: KeyRound, title: "Multi-tenant & RBAC", body: "Tenant isolation, granular permissions, and audit trails by default." },
      { Icon: Cloud, title: "Cloud & CI/CD", body: "Infrastructure as code, automated deploys, monitoring, cost control." },
      { Icon: BookOpen, title: "Documented handover", body: "Your team can run and extend it without us in the room." },
    ],
    stack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "Terraform", "AWS", "Kubernetes"],
  },
  {
    id: "ai",
    Icon: Sparkles,
    label: "AI Solutions",
    title: "AI features measured on outcomes, not on novelty.",
    lead: "We start from the task you need done and work back to whether a model is the right tool — then constrain it, evaluate it, and cap what it can cost you.",
    accent: "#10B981",
    Visual: AIFlowViz,
    delivers: [
      { Icon: FileSearch, title: "Document intelligence", body: "Parsing, extraction, and classification at volume, with confidence scores." },
      { Icon: MessagesSquare, title: "Grounded assistants", body: "Retrieval over your own content, so answers cite something real." },
      { Icon: Cog, title: "Workflow automation", body: "The model handles judgement; ordinary code handles everything else." },
      { Icon: Gauge, title: "Evaluation harnesses", body: "A prompt change becomes a measurable decision, not a vibe." },
      { Icon: Wallet, title: "Cost guard rails", body: "Quotas, rate limits, and fallbacks that keep inference spend predictable." },
    ],
    stack: ["Python", "LLM APIs", "RAG pipelines", "Vector search", "Evaluation harnesses", "Prompt versioning"],
  },
];

function CapabilityBlock({
  capability,
  index,
  onActive,
}: {
  capability: Capability;
  index: number;
  onActive: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  // Report activity from an effect — setting parent state during render is a
  // React error, not just a warning.
  useEffect(() => {
    if (inView) onActive(capability.id);
  }, [inView, capability.id, onActive]);

  const { Icon, accent, Visual } = capability;

  return (
    <div ref={ref} id={capability.id} className="scroll-mt-28 py-16 first:pt-0 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}
          >
            <Icon size={19} style={{ color: accent }} />
          </span>
          <span className="font-mono text-xs text-stone-600">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>
            {capability.label}
          </span>
        </div>

        <h3 className="mt-6 max-w-2xl text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl">
          {capability.title}
        </h3>
        <p className="mt-4 max-w-2xl leading-relaxed text-stone-400">{capability.lead}</p>
      </motion.div>

      {/* The diagram carries the explanation — it shows the shape of the work. */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="mt-10 rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900/80 to-stone-900/30 p-6 sm:p-8"
      >
        <Visual accent={accent} />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {capability.delivers.map(({ Icon: ItemIcon, title, body }) => (
          <motion.div
            key={title}
            variants={{
              hidden: { opacity: 0, y: reduced ? 0 : 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
            }}
            whileHover={reduced ? undefined : { y: -3 }}
            className="group relative overflow-hidden rounded-xl border border-stone-800/80 bg-stone-900/40 p-5 transition-colors hover:border-stone-700"
          >
            {/* Accent wash that blooms on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: accent }}
            />
            <ItemIcon size={17} style={{ color: accent }} />
            <p className="relative mt-3 text-sm font-semibold text-white">{title}</p>
            <p className="relative mt-1.5 text-xs leading-relaxed text-stone-400">{body}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.ul
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 flex flex-wrap gap-2"
      >
        {capability.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-lg border border-stone-800 px-3 py-1.5 text-xs text-stone-500"
          >
            {tech}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function Capabilities() {
  const [active, setActive] = useState("data");
  const handleActive = useCallback((id: string) => setActive(id), []);

  return (
    <section id="capabilities" className="scroll-mt-20 border-b border-stone-900 bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:gap-16">
          {/* Sticky rail — tracks which capability you are reading */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                Capabilities
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                Three disciplines,<br />one team.
              </h2>
              <p className="mt-4 leading-relaxed text-stone-400">
                Most problems worth solving cross all three. Handing them between
                separate vendors is where the cost and the finger-pointing come from.
              </p>

              <nav className="mt-10 hidden space-y-1 lg:block" aria-label="Capabilities">
                {CAPABILITIES.map((c, i) => {
                  const isActive = active === c.id;
                  return (
                    <a
                      key={c.id}
                      href={`#${c.id}`}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-stone-900"
                    >
                      <span className="relative flex h-6 w-px shrink-0 justify-center bg-stone-800">
                        {isActive && (
                          <motion.span
                            layoutId="capability-marker"
                            className="absolute inset-0 w-px"
                            style={{ background: c.accent }}
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                      </span>
                      <span className="font-mono text-[11px] text-stone-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm transition-colors ${
                          isActive ? "font-semibold text-white" : "text-stone-500 group-hover:text-stone-300"
                        }`}
                      >
                        {c.label}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-8">
            {CAPABILITIES.map((c, i) => (
              <CapabilityBlock key={c.id} capability={c} index={i} onActive={handleActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
