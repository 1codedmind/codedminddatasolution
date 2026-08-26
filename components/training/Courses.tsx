"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { BarChart3, Database, BrainCircuit, Check, Hammer, Target, Users2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Level = "Foundation" | "Applied" | "Production";

type Module = {
  level: Level;
  title: string;
  line: string;
  topics: string[];
};

type Course = {
  id: string;
  Icon: LucideIcon;
  accent: string;
  name: string;
  tagline: string;
  bestIf: string;
  modules: Module[];
  outcomes: string[];
  project: { name: string; line: string };
  tools: string[];
};

/**
 * Curriculum data.
 *
 * Each module is a short title, a one-line purpose, and its topics as chips.
 * The first version of this page carried the same information as three-sentence
 * paragraphs, and fifteen of those stacked up is a wall nobody reads — chips
 * are scannable, and a reader can still see every topic.
 *
 * Still deliberately absent: durations, fees, cohort sizes and pass rates.
 * Those are agreed per engagement.
 */
const COURSES: Course[] = [
  {
    id: "data-science",
    Icon: BarChart3,
    accent: "#059669",
    name: "Data Science",
    tagline: "Turn a messy dataset and a vague question into an answer people can act on.",
    bestIf: "You already work with data in spreadsheets or SQL, and want to analyse and model it properly.",
    modules: [
      {
        level: "Foundation",
        title: "Python for analysis",
        line: "Handle real data without corrupting it.",
        topics: ["pandas", "NumPy", "joins", "reshaping", "missing data"],
      },
      {
        level: "Foundation",
        title: "Statistics you can defend",
        line: "Know when a result is real.",
        topics: ["distributions", "sampling", "confidence intervals", "hypothesis tests"],
      },
      {
        level: "Applied",
        title: "Exploratory analysis",
        line: "Find the shape of the data before modelling it.",
        topics: ["profiling", "outliers", "correlation", "segmentation", "charting"],
      },
      {
        level: "Applied",
        title: "Modelling",
        line: "Build a predictive model and validate it honestly.",
        topics: ["regression", "classification", "feature prep", "cross-validation"],
      },
      {
        level: "Production",
        title: "Communicating results",
        line: "Get a decision made from your analysis.",
        topics: ["assumptions", "uncertainty", "narrative", "stakeholder review"],
      },
    ],
    outcomes: [
      "Clean and join real datasets without silently dropping or duplicating rows",
      "Pick the right test, and state honestly how confident the result is",
      "Build a validated model and explain what it will and will not predict",
      "Present an analysis that survives a senior stakeholder pushing back",
    ],
    project: {
      name: "An analysis, end to end",
      line: "Take a raw dataset through cleaning, modelling and validation to a written recommendation.",
    },
    tools: ["Python", "pandas", "NumPy", "scikit-learn", "Jupyter", "SQL", "Matplotlib"],
  },
  {
    id: "data-engineering",
    Icon: Database,
    accent: "#2563EB",
    name: "Data Engineering",
    tagline: "Build pipelines and warehouses other people can run without fear.",
    bestIf: "You write SQL or code, and you now own — or are about to inherit — data pipelines.",
    modules: [
      {
        level: "Foundation",
        title: "SQL past the basics",
        line: "Write queries that stay fast as the data grows.",
        topics: ["window functions", "CTEs", "indexes", "EXPLAIN plans"],
      },
      {
        level: "Foundation",
        title: "Warehouse modelling",
        line: "Shape tables so queries stay cheap.",
        topics: ["dimensional modelling", "slowly changing dimensions", "partitioning"],
      },
      {
        level: "Applied",
        title: "Pipelines & orchestration",
        line: "Make every run safe to repeat.",
        topics: ["ETL vs ELT", "idempotency", "backfills", "Airflow DAGs", "retries"],
      },
      {
        level: "Applied",
        title: "Transformation as code",
        line: "Version, test and review your business logic.",
        topics: ["dbt models", "tests", "documentation", "CI"],
      },
      {
        level: "Production",
        title: "Quality, monitoring & cost",
        line: "Find out before your users do.",
        topics: ["data contracts", "freshness checks", "alerting", "warehouse spend"],
      },
    ],
    outcomes: [
      "Design a pipeline a colleague can operate without calling you",
      "Debug a failed run from the logs instead of guessing",
      "Rerun and backfill safely, without double-counting",
      "Explain — and reduce — what a warehouse bill is actually paying for",
    ],
    project: {
      name: "A tested pipeline",
      line: "Ingest, transform and test a dataset on a schedule, with alerting when it breaks.",
    },
    tools: ["SQL", "Airflow", "dbt", "Spark", "Snowflake", "BigQuery", "Databricks", "Kafka"],
  },
  {
    id: "ai",
    Icon: BrainCircuit,
    accent: "#9333EA",
    name: "AI & Machine Learning",
    tagline: "Ship an AI feature that holds up in front of real users, not just a demo.",
    bestIf: "You can already code, and you now need to put a model into a product.",
    modules: [
      {
        level: "Foundation",
        title: "How models actually behave",
        line: "Know where they are reliable and where they invent.",
        topics: ["tokens", "context windows", "temperature", "cost", "failure modes"],
      },
      {
        level: "Foundation",
        title: "Prompting & structured output",
        line: "Get predictable, parseable answers.",
        topics: ["system design", "JSON schemas", "refusals", "truncation"],
      },
      {
        level: "Applied",
        title: "Retrieval (RAG)",
        line: "Make the model answer from your content, not its memory.",
        topics: ["chunking", "embeddings", "vector search", "hybrid retrieval", "citations"],
      },
      {
        level: "Applied",
        title: "Evaluation",
        line: "Prove a change actually made it better.",
        topics: ["test sets", "scoring", "regressions", "human review"],
      },
      {
        level: "Production",
        title: "Shipping safely",
        line: "Survive strangers typing into your product.",
        topics: ["rate limits", "prompt injection", "abuse handling", "cost ceilings"],
      },
    ],
    outcomes: [
      "Ground answers in your own content so the model quotes you, not itself",
      "Measure whether a prompt or model change improved quality, rather than guessing",
      "Bound the worst-case bill before it arrives",
      "Handle prompt injection and abuse instead of hoping nobody tries",
    ],
    project: {
      name: "A grounded assistant",
      line: "A retrieval-backed assistant over your own documents, with an evaluation set to score it.",
    },
    tools: ["Python", "embeddings", "vector search", "RAG", "LLM APIs", "eval harnesses"],
  },
];

function LevelChip({ level, accent }: { level: Level; accent: string }) {
  const isProduction = level === "Production";
  return (
    <span
      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={
        isProduction
          ? { background: accent, color: "#fff" }
          : { background: `${accent}14`, color: accent }
      }
    >
      {level}
    </span>
  );
}

/** Hoisted: a component defined inside another is remounted on every render. */
function CourseSection({ course, index }: { course: Course; index: number }) {
  const reduced = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const { Icon, accent } = course;

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 70%", "end 65%"],
  });
  // Spring so the fill glides rather than tracking the wheel exactly.
  const railProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div id={course.id} className="scroll-mt-24 border-t border-stone-200 first:border-t-0">
      <div className="py-16 lg:py-20">
        {/* Course header */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="overflow-hidden rounded-2xl border border-stone-200"
        >
          <div
            className="flex flex-wrap items-center gap-4 px-6 py-5 sm:px-8"
            style={{ background: `${accent}0d`, borderBottom: `1px solid ${accent}26` }}
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}
            >
              <Icon size={21} style={{ color: accent }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] text-stone-400">
                Course {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="text-xl font-extrabold tracking-tight text-stone-950 sm:text-2xl">
                {course.name}
              </h3>
            </div>
          </div>

          <div className="bg-white px-6 py-5 sm:px-8">
            <p className="max-w-2xl text-[15px] leading-relaxed text-stone-700">
              {course.tagline}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-stone-500">
              <Users2 size={15} className="mt-0.5 shrink-0 text-stone-400" />
              <span>
                <span className="font-semibold text-stone-600">Best if: </span>
                {course.bestIf}
              </span>
            </p>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Curriculum */}
          <div className="lg:col-span-7">
            <div className="mb-5 flex items-center gap-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-stone-400">
                What you cover
              </h4>
              <span className="h-px flex-1 bg-stone-200" />
            </div>

            {/* A spine that fills as the course is read. The gradient runs from
                a pale accent to full strength, which is the level progression
                — Foundation through to Production — shown rather than labelled
                in a separate bar. */}
            <div ref={railRef} className="relative">
              <span
                aria-hidden="true"
                className="absolute left-[19px] top-4 h-[calc(100%-2rem)] w-px bg-stone-200"
              />
              <motion.span
                aria-hidden="true"
                style={{
                  scaleY: reduced ? 1 : railProgress,
                  background: `linear-gradient(to bottom, ${accent}40, ${accent})`,
                }}
                className="absolute left-[19px] top-4 h-[calc(100%-2rem)] w-px origin-top"
              />

              <motion.ol
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
              >
                {course.modules.map((m, i) => (
                  <motion.li
                    key={m.title}
                    variants={{
                      hidden: { opacity: 0, y: reduced ? 0 : 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
                    }}
                    className="relative flex gap-5"
                  >
                    <span
                      className="relative z-10 mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white font-mono text-xs font-bold"
                      style={{ borderColor: `${accent}40`, color: accent }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h5 className="text-[15px] font-bold text-stone-950">{m.title}</h5>
                        <LevelChip level={m.level} accent={accent} />
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-stone-600">{m.line}</p>

                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {m.topics.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </div>

          {/* Impact — sticky, so the reason to take the course stays on screen
              the whole time the curriculum is being read. */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: EASE }}
                className="rounded-2xl border-2 bg-white p-6"
                style={{ borderColor: `${accent}33` }}
              >
                <div className="flex items-center gap-2">
                  <Target size={16} style={{ color: accent }} />
                  <h4 className="text-sm font-bold uppercase tracking-widest" style={{ color: accent }}>
                    What you can do after
                  </h4>
                </div>

                <ul className="mt-5 space-y-3.5">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: `${accent}1a` }}
                      >
                        <Check size={12} strokeWidth={3} style={{ color: accent }} />
                      </span>
                      <span className="text-sm leading-relaxed text-stone-700">{o}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl bg-stone-50 p-5">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                    <Hammer size={13} className="text-stone-400" />
                    You build
                  </p>
                  <p className="mt-2 text-sm font-bold text-stone-900">{course.project.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    {course.project.line}
                  </p>
                </div>

                <div className="mt-6 border-t border-stone-200 pt-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                    Tools
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {course.tools.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-stone-200 px-2.5 py-1 text-[11px] text-stone-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  const reduced = useReducedMotion();

  return (
    <section id="courses" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Comparison — the whole offer on one screen, before any depth. */}
        <div className="border-b border-stone-200 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="max-w-2xl"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
              The courses
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
              Which one fits you?
            </h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              Each course runs from fundamentals to production practice. Take one,
              or run them in sequence — engineering after science, AI after either.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {COURSES.map(({ id, Icon, accent, name, tagline, bestIf, project }) => (
              <motion.a
                key={id}
                href={`#${id}`}
                variants={{
                  hidden: { opacity: 0, y: reduced ? 0 : 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                }}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-stone-300 hover:shadow-md"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
                >
                  <Icon size={19} style={{ color: accent }} />
                </span>

                <h3 className="mt-5 text-lg font-bold text-stone-950">{name}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-600">{tagline}</p>

                <dl className="mt-5 space-y-3 border-t border-stone-200 pt-5 text-sm">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                      Best if
                    </dt>
                    <dd className="mt-1 leading-relaxed text-stone-600">{bestIf}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                      You build
                    </dt>
                    <dd className="mt-1 font-semibold text-stone-800">{project.name}</dd>
                  </div>
                </dl>

                <span
                  className="mt-5 text-xs font-bold transition-colors"
                  style={{ color: accent }}
                >
                  See the full curriculum →
                </span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {COURSES.map((c, i) => (
          <CourseSection key={c.id} course={c} index={i} />
        ))}
      </div>
    </section>
  );
}
