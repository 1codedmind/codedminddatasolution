import {
  GitBranch,
  Cloud,
  BarChart2,
  Zap,
  Package,
  ShieldCheck,
} from "lucide-react";

const services = [
  {
    icon: GitBranch,
    title: "Data Engineering",
    description:
      "Design and build robust, scalable data pipelines that reliably move and transform data across your systems.",
  },
  {
    icon: Cloud,
    title: "Cloud Data Solutions",
    description:
      "Architect and deploy cloud-native data infrastructure on AWS, GCP, or Azure tailored to your workloads.",
  },
  {
    icon: BarChart2,
    title: "Reporting & Dashboards",
    description:
      "Create clear, interactive dashboards and automated reports that give stakeholders real-time business visibility.",
  },
  {
    icon: Zap,
    title: "Data Automation",
    description:
      "Eliminate manual data tasks with intelligent automation — from ingestion to transformation and delivery.",
  },
  {
    icon: Package,
    title: "Custom Data Products",
    description:
      "Build purpose-built internal data tools, APIs, and analytics applications aligned to your business needs.",
  },
  {
    icon: ShieldCheck,
    title: "Data Quality & Optimization",
    description:
      "Implement validation, monitoring, and performance tuning to keep your data clean, accurate, and fast.",
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-stone-100/70 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — split layout */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-3">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              End-to-End Data Services
            </h2>
          </div>
          <p className="text-stone-600 text-base max-w-sm md:text-right leading-relaxed">
            From raw data to actionable insights — we cover the full spectrum of
            modern data engineering.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon container */}
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 text-amber-700 mb-5 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200">
                <Icon size={20} />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
