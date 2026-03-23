import { ArrowUpRight } from "lucide-react";

const solutions = [
  {
    title: "Automated Business Reporting",
    description:
      "Replace manual report generation with scheduled, automated pipelines that deliver accurate reports on time, every time.",
  },
  {
    title: "Operational Dashboards",
    description:
      "Give teams real-time visibility into KPIs and operational metrics through clean, intuitive dashboards.",
  },
  {
    title: "Data Migration & Transformation",
    description:
      "Safely migrate legacy data to modern platforms and transform it into well-structured, analysis-ready formats.",
  },
  {
    title: "Financial & Reconciliation Reporting",
    description:
      "Automate complex financial reconciliation and compliance reporting with precision and full auditability.",
  },
  {
    title: "AI/ML-Ready Data Pipelines",
    description:
      "Prepare clean, well-documented datasets and feature stores that power your machine learning models.",
  },
  {
    title: "Internal Analytics Tools",
    description:
      "Build lightweight internal tools and data apps that give your team self-serve access to business data.",
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3">
            Solutions
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Problems We Solve
          </h2>
          <p className="mt-4 text-stone-600 text-lg leading-relaxed">
            Practical, business-focused solutions designed to reduce friction and
            accelerate data-driven decisions.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {solutions.map(({ title, description }, i) => (
            <div
              key={title}
              className="group relative flex items-start gap-5 p-6 rounded-2xl border border-stone-200/80 bg-stone-50 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-200"
            >
              {/* Number badge */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Arrow — visible on hover */}
              <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5">
                <ArrowUpRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
