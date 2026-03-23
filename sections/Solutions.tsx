import { CheckCircle2 } from "lucide-react";

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
    <section id="solutions" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-2">
            Solutions
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Problems We Solve
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Practical, business-focused solutions designed to reduce friction and
            accelerate data-driven decisions.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map(({ title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-200"
            >
              <div className="shrink-0 mt-0.5">
                <CheckCircle2 size={20} className="text-teal-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
