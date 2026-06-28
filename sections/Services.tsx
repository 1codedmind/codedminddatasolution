"use client";

import Image from "next/image";
import { GitBranch, Cloud, BarChart2, Zap, Package, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";
import {
  siSnowflake, siGooglecloud, siDatabricks,
  siApacheairflow, siApachespark, siApachekafka,
  siTerraform, siKubernetes, siPalantir, siGooglebigquery,
} from "simple-icons";

/* ── platform data ────────────────────────────────────────────────────── */

type SiPlatform  = { kind: "si";  path: string; hex: string; label: string };
type ImgPlatform = { kind: "img"; src: string;  label: string; bg?: string };
type Platform    = SiPlatform | ImgPlatform;

const platforms: Record<string, Platform> = {
  "Snowflake":    { kind:"si",  path: siSnowflake.path,      hex: siSnowflake.hex,      label: "Snowflake" },
  "Google Cloud": { kind:"si",  path: siGooglecloud.path,    hex: siGooglecloud.hex,    label: "Google Cloud" },
  "Databricks":   { kind:"si",  path: siDatabricks.path,     hex: siDatabricks.hex,     label: "Databricks" },
  "Airflow":      { kind:"si",  path: siApacheairflow.path,  hex: siApacheairflow.hex,  label: "Apache Airflow" },
  "Spark":        { kind:"si",  path: siApachespark.path,    hex: siApachespark.hex,    label: "Apache Spark" },
  "Kafka":        { kind:"si",  path: siApachekafka.path,    hex: siApachekafka.hex,    label: "Kafka" },
  "Terraform":    { kind:"si",  path: siTerraform.path,      hex: siTerraform.hex,      label: "Terraform" },
  "Kubernetes":   { kind:"si",  path: siKubernetes.path,     hex: siKubernetes.hex,     label: "Kubernetes" },
  "Palantir":     { kind:"si",  path: siPalantir.path,       hex: "9CA3AF",             label: "Palantir" },
  "BigQuery":     { kind:"si",  path: siGooglebigquery.path, hex: siGooglebigquery.hex, label: "BigQuery" },
  // downloaded official logos
  "AWS":          { kind:"img", src: "/logos/aws.svg",      label: "AWS" },
  "Azure":        { kind:"img", src: "/logos/azure.svg",    label: "Microsoft Azure" },
  "dbt":          { kind:"img", src: "/logos/dbt.svg",      label: "dbt", bg: "#FF694B" },
  "Tableau":      { kind:"img", src: "/logos/tableau.png",  label: "Tableau" },
  "Power BI":     { kind:"img", src: "/logos/powerbi.svg",  label: "Power BI" },
  "Redshift":     { kind:"si",  path: siGooglebigquery.path, hex: "8C4FFF", label: "Amazon Redshift" },
};

const marqueeOrder = [
  "AWS","Snowflake","Google Cloud","Azure","Databricks","Palantir",
  "dbt","Airflow","Spark","Kafka","BigQuery","Redshift",
  "Tableau","Power BI","Terraform","Kubernetes",
];

/* ── services ─────────────────────────────────────────────────────────── */

const services = [
  {
    icon: GitBranch,
    title: "Data Engineering",
    description: "Scalable ETL/ELT pipelines that move and transform data reliably across your entire stack.",
    platformKeys: ["Airflow","dbt","Spark","Kafka","Terraform"],
    from: "#F59E0B", to: "#EA580C",
  },
  {
    icon: Cloud,
    title: "Cloud Data Solutions",
    description: "Cloud-native data infrastructure on AWS, GCP, or Azure — architected to your workloads and cost.",
    platformKeys: ["AWS","Google Cloud","Azure","Databricks","Kubernetes"],
    from: "#3B82F6", to: "#4F46E5",
  },
  {
    icon: BarChart2,
    title: "Reporting & Dashboards",
    description: "Interactive dashboards and automated reports that surface real-time business performance.",
    platformKeys: ["BigQuery","Snowflake","Tableau","Power BI","Redshift"],
    from: "#10B981", to: "#0891B2",
  },
  {
    icon: Zap,
    title: "Data Automation",
    description: "End-to-end automation from ingestion and transformation through to delivery and alerting.",
    platformKeys: ["Airflow","Kafka","AWS","dbt","Spark"],
    from: "#A855F7", to: "#EC4899",
  },
  {
    icon: Package,
    title: "Custom Data Products",
    description: "Internal tools, APIs, and analytics apps purpose-built around your team's data workflows.",
    platformKeys: ["BigQuery","Snowflake","Databricks","Google Cloud","AWS"],
    from: "#F97316", to: "#EAB308",
  },
  {
    icon: ShieldCheck,
    title: "Data Quality & Optimization",
    description: "Validation, monitoring, and performance tuning that keeps your data clean, fast, and trusted.",
    platformKeys: ["dbt","Snowflake","Spark","Databricks","Palantir"],
    from: "#14B8A6", to: "#6366F1",
  },
];

/* ── sub-components ───────────────────────────────────────────────────── */

function PlatformIcon({ p, size = 16 }: { p: Platform; size?: number }) {
  if (p.kind === "si") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: `#${p.hex}` }} aria-hidden="true">
        <path d={p.path} />
      </svg>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded overflow-hidden shrink-0"
      style={{ width: size, height: size, background: p.bg ?? "transparent" }}
    >
      <Image
        src={p.src}
        alt={p.label}
        width={size}
        height={size}
        className="object-contain w-full h-full"
        unoptimized
      />
    </span>
  );
}

function PlatformBadge({ name }: { name: string }) {
  const p = platforms[name];
  if (!p) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-[11px] font-medium text-stone-300">
      <PlatformIcon p={p} size={13} />
      {p.label}
    </span>
  );
}

function MarqueeItem({ name }: { name: string }) {
  const p = platforms[name];
  if (!p) return null;
  return (
    <span className="inline-flex items-center gap-2.5 shrink-0 select-none mr-8">
      <PlatformIcon p={p} size={20} />
      <span className="text-[13px] font-medium text-stone-300">{p.label}</span>
    </span>
  );
}

/* ── main component ───────────────────────────────────────────────────── */

export default function Services() {
  return (
    <section id="services" className="bg-white border-b border-stone-200 overflow-hidden">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <motion.div
          className="max-w-xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Services</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">What we build</h2>
          <p className="mt-4 text-stone-500 leading-relaxed">
            End-to-end data services — from architecture through to deployment and ongoing optimization.
          </p>
        </motion.div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-10">
          <motion.div
            className="flex gap-4 w-max"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {services.map(({ icon: Icon, title, description, platformKeys, from, to }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="w-[300px] shrink-0 flex flex-col bg-stone-950 rounded-2xl overflow-hidden border border-stone-800"
              >
                {/* Gradient header bar with icon */}
                <div
                  className="h-[70px] flex items-center px-6"
                  style={{ background: `linear-gradient(135deg, ${from}22, ${to}11)`, borderBottom: `1px solid ${from}33` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    <Icon size={18} className="text-white" strokeWidth={1.75} />
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-6">
                  <h3 className="text-[15px] font-bold text-white mb-2 leading-snug">{title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed flex-1">{description}</p>
                  <div className="mt-5 pt-5 border-t border-stone-800 flex flex-wrap gap-1.5">
                    {platformKeys.map((k) => <PlatformBadge key={k} name={k} />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Platform marquee */}
      <div className="bg-stone-950 border-t border-stone-900 py-5 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />
        <div className="flex animate-marquee w-max">
          {[...marqueeOrder, ...marqueeOrder].map((name, i) => (
            <MarqueeItem key={i} name={name} />
          ))}
        </div>
      </div>

    </section>
  );
}
