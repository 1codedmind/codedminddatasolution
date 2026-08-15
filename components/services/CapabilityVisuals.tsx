"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * One bespoke diagram per capability.
 *
 * These are meant to show the shape of the work — a pipeline that moves data,
 * a stack that layers, a model wrapped in guard rails — rather than decorate
 * the page. Each animates once it scrolls into view and holds a readable
 * static state when the visitor prefers reduced motion.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Data engineering: sources flowing through a pipeline to a dashboard ──── */

const PIPELINE_NODES = [
  { x: 34, label: "Sources" },
  { x: 142, label: "Pipeline" },
  { x: 250, label: "Warehouse" },
  { x: 358, label: "Insight" },
];

export function DataPipelineViz({ accent }: { accent: string }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 392 150"
      className="h-auto w-full"
      role="img"
      aria-label="Data flowing from source systems through a pipeline into a warehouse and out to dashboards"
    >
      {/* Connectors */}
      {PIPELINE_NODES.slice(0, -1).map((node, i) => (
        <motion.line
          key={`line-${i}`}
          x1={node.x + 22}
          y1={62}
          x2={PIPELINE_NODES[i + 1].x - 22}
          y2={62}
          stroke="#44403c"
          strokeWidth={1.5}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: EASE }}
        />
      ))}

      {/* Packets travelling the line */}
      {!reduced &&
        PIPELINE_NODES.slice(0, -1).map((node, i) =>
          [0, 1, 2].map((d) => (
            <motion.circle
              key={`packet-${i}-${d}`}
              cy={62}
              r={2.5}
              fill={accent}
              initial={{ cx: node.x + 22, opacity: 0 }}
              whileInView={{
                cx: [node.x + 22, PIPELINE_NODES[i + 1].x - 22],
                opacity: [0, 1, 1, 0],
              }}
              viewport={{ once: false }}
              transition={{
                duration: 1.6,
                delay: i * 0.35 + d * 0.5,
                repeat: Infinity,
                repeatDelay: 0.7,
                ease: "linear",
              }}
            />
          )),
        )}

      {/* Nodes */}
      {PIPELINE_NODES.map((node, i) => (
        <motion.g
          key={node.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: i * 0.12, ease: EASE }}
        >
          <rect
            x={node.x - 22}
            y={40}
            width={44}
            height={44}
            rx={12}
            fill="#1c1917"
            stroke={i === 1 || i === 2 ? accent : "#44403c"}
            strokeWidth={1.5}
          />
          {/* A small glyph hinting at each stage */}
          {i === 0 && (
            <>
              <rect x={node.x - 9} y={51} width={18} height={4} rx={2} fill={accent} opacity={0.75} />
              <rect x={node.x - 9} y={60} width={18} height={4} rx={2} fill={accent} opacity={0.5} />
              <rect x={node.x - 9} y={69} width={18} height={4} rx={2} fill={accent} opacity={0.3} />
            </>
          )}
          {i === 1 && (
            <motion.g
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: `${node.x}px 62px` }}
            >
              <circle cx={node.x} cy={62} r={9} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={node.x} cy={62} r={2.5} fill={accent} />
            </motion.g>
          )}
          {i === 2 && (
            <>
              <ellipse cx={node.x} cy={54} rx={11} ry={4} fill="none" stroke={accent} strokeWidth={1.5} />
              <path d={`M${node.x - 11} 54 v14 a11 4 0 0 0 22 0 v-14`} fill="none" stroke={accent} strokeWidth={1.5} />
            </>
          )}
          {i === 3 && (
            <>
              <rect x={node.x - 10} y={66} width={5} height={7} rx={1} fill={accent} opacity={0.55} />
              <rect x={node.x - 2.5} y={59} width={5} height={14} rx={1} fill={accent} opacity={0.8} />
              <rect x={node.x + 5} y={53} width={5} height={20} rx={1} fill={accent} />
            </>
          )}
          <text
            x={node.x}
            y={104}
            textAnchor="middle"
            className="fill-stone-500"
            style={{ fontSize: 10, letterSpacing: 0.4 }}
          >
            {node.label}
          </text>
        </motion.g>
      ))}

      {/* Quality gate annotation */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.85 }}
      >
        <line x1={196} y1={30} x2={196} y2={40} stroke="#44403c" strokeWidth={1} strokeDasharray="2 2" />
        <text x={196} y={24} textAnchor="middle" className="fill-stone-600" style={{ fontSize: 9 }}>
          tested + monitored
        </text>
      </motion.g>
    </svg>
  );
}

/* ── Full-stack: layers that assemble into one system ─────────────────────── */

const STACK_LAYERS = [
  { label: "Interface", detail: "React · Next.js" },
  { label: "API", detail: "Node · REST" },
  { label: "Data", detail: "PostgreSQL" },
  { label: "Infrastructure", detail: "Docker · Terraform" },
];

export function StackViz({ accent }: { accent: string }) {
  const reduced = useReducedMotion();

  return (
    <div className="w-full space-y-2.5" role="img" aria-label="Interface, API, data, and infrastructure layers stacked into one system">
      {STACK_LAYERS.map((layer, i) => (
        <motion.div
          key={layer.label}
          initial={{ opacity: 0, x: reduced ? 0 : -28, rotateX: reduced ? 0 : -18 }}
          whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, delay: i * 0.1, ease: EASE }}
          whileHover={reduced ? undefined : { x: 8 }}
          className="flex items-center justify-between rounded-xl border bg-stone-900/70 px-4 py-3"
          style={{
            borderColor: `${accent}33`,
            // Each layer sits slightly inset from the one above, so the group
            // reads as a stack rather than a plain list.
            marginLeft: `${i * 10}px`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full" style={{ background: accent, opacity: 1 - i * 0.18 }} />
            <span className="text-sm font-semibold text-white">{layer.label}</span>
          </div>
          <span className="font-mono text-[11px] text-stone-500">{layer.detail}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── AI: input, a constrained model, evaluated output ─────────────────────── */

export function AIFlowViz({ accent }: { accent: string }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 392 150"
      className="h-auto w-full"
      role="img"
      aria-label="Unstructured input passing through an evaluated model into structured output"
    >
      {/* Input document */}
      <motion.g
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <rect x={20} y={34} width={62} height={76} rx={8} fill="#1c1917" stroke="#44403c" strokeWidth={1.5} />
        {[0, 1, 2, 3, 4].map((r) => (
          <rect
            key={r}
            x={31}
            y={48 + r * 12}
            width={r === 4 ? 24 : 40}
            height={4}
            rx={2}
            fill="#57534e"
          />
        ))}
        <text x={51} y={126} textAnchor="middle" className="fill-stone-500" style={{ fontSize: 10 }}>
          Unstructured
        </text>
      </motion.g>

      {/* Flow into the model */}
      <motion.line
        x1={88} y1={72} x2={148} y2={72}
        stroke="#44403c" strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.25 }}
      />
      {!reduced &&
        [0, 1].map((d) => (
          <motion.circle
            key={`in-${d}`}
            cy={72} r={2.5} fill={accent}
            initial={{ cx: 88, opacity: 0 }}
            whileInView={{ cx: [88, 148], opacity: [0, 1, 1, 0] }}
            viewport={{ once: false }}
            transition={{ duration: 1.3, delay: d * 0.65, repeat: Infinity, repeatDelay: 0.9, ease: "linear" }}
          />
        ))}

      {/* Model core */}
      <motion.g
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
      >
        {!reduced &&
          [0, 1].map((ring) => (
            <motion.circle
              key={`ring-${ring}`}
              cx={196} cy={72} r={26}
              fill="none" stroke={accent} strokeWidth={1}
              initial={{ opacity: 0.5, scale: 1 }}
              animate={{ opacity: [0.5, 0], scale: [1, 1.65] }}
              transition={{ duration: 2.4, delay: ring * 1.2, repeat: Infinity, ease: "easeOut" }}
              style={{ transformOrigin: "196px 72px" }}
            />
          ))}
        <circle cx={196} cy={72} r={26} fill="#1c1917" stroke={accent} strokeWidth={1.5} />
        <path
          d="M196 60 l4.5 9 9.5 1.4 -7 6.7 1.7 9.6 -8.7-4.6 -8.7 4.6 1.7-9.6 -7-6.7 9.5-1.4 z"
          fill={accent}
        />
        <text x={196} y={126} textAnchor="middle" className="fill-stone-500" style={{ fontSize: 10 }}>
          Constrained model
        </text>
      </motion.g>

      {/* Evaluation gate above the model */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <line x1={196} y1={30} x2={196} y2={44} stroke="#44403c" strokeWidth={1} strokeDasharray="2 2" />
        <text x={196} y={24} textAnchor="middle" className="fill-stone-600" style={{ fontSize: 9 }}>
          evaluated + rate limited
        </text>
      </motion.g>

      {/* Flow out */}
      <motion.line
        x1={244} y1={72} x2={300} y2={72}
        stroke="#44403c" strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.45 }}
      />
      {!reduced &&
        [0, 1].map((d) => (
          <motion.circle
            key={`out-${d}`}
            cy={72} r={2.5} fill={accent}
            initial={{ cx: 244, opacity: 0 }}
            whileInView={{ cx: [244, 300], opacity: [0, 1, 1, 0] }}
            viewport={{ once: false }}
            transition={{ duration: 1.3, delay: 0.5 + d * 0.65, repeat: Infinity, repeatDelay: 0.9, ease: "linear" }}
          />
        ))}

      {/* Structured output */}
      <motion.g
        initial={{ opacity: 0, x: 12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
      >
        <rect x={306} y={34} width={66} height={76} rx={8} fill="#1c1917" stroke={accent} strokeWidth={1.5} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={316} y={47 + r * 15} width={16} height={4} rx={2} fill={accent} opacity={0.55} />
            <rect x={337} y={47 + r * 15} width={25} height={4} rx={2} fill="#57534e" />
          </g>
        ))}
        <text x={339} y={126} textAnchor="middle" className="fill-stone-500" style={{ fontSize: 10 }}>
          Structured
        </text>
      </motion.g>
    </svg>
  );
}
