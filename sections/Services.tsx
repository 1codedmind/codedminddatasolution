import { GitBranch, Cloud, BarChart2, Zap, Package, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: GitBranch,
    number: "01",
    title: "Data Engineering",
    description:
      "Robust, scalable pipelines that reliably move and transform data across your systems — Airflow, dbt, Spark, and modern ELT tooling.",
  },
  {
    icon: Cloud,
    number: "02",
    title: "Cloud Data Solutions",
    description:
      "Cloud-native data infrastructure on AWS, GCP, or Azure, architected to your workloads and cost profile.",
  },
  {
    icon: BarChart2,
    number: "03",
    title: "Reporting & Dashboards",
    description:
      "Interactive dashboards and automated reports that give stakeholders real-time visibility into business performance.",
  },
  {
    icon: Zap,
    number: "04",
    title: "Data Automation",
    description:
      "Eliminate manual data work with end-to-end automation — from ingestion and transformation through to scheduled delivery.",
  },
  {
    icon: Package,
    number: "05",
    title: "Custom Data Products",
    description:
      "Internal tools, APIs, and analytics applications purpose-built around your team's specific data needs.",
  },
  {
    icon: ShieldCheck,
    number: "06",
    title: "Data Quality & Optimization",
    description:
      "Validation, monitoring, and performance tuning that keeps your data clean, accurate, and fast at any scale.",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-[#fcfaf6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            What we do
          </h2>
          <p className="mt-3 text-stone-500 text-base max-w-lg leading-relaxed">
            End-to-end data services — from architecture through to deployment and
            ongoing optimization.
          </p>
        </div>

        {/* Editorial row list */}
        <div className="divide-y divide-stone-200">
          {services.map(({ icon: Icon, number, title, description }) => (
            <div
              key={number}
              className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[2.5rem_13rem_1fr_1.5rem] gap-x-6 items-start py-6 cursor-default"
            >
              <span className="text-xs font-bold text-stone-300 tabular-nums pt-1 select-none">{number}</span>

              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-all duration-150">
                  <Icon size={15} />
                </div>
                <h3 className="text-[15px] font-semibold text-stone-900">{title}</h3>
              </div>

              <p className="col-span-2 md:col-span-1 mt-3 md:mt-0 text-sm text-stone-500 leading-relaxed max-w-xl">
                {description}
              </p>

              <span className="hidden md:block text-stone-300 group-hover:text-amber-600 transition-colors pt-0.5">
                →
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
