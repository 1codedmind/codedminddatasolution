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
    <section id="services" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            End-to-End Data Services
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            From raw data to actionable insights — we cover the full spectrum of
            modern data engineering.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 mb-4">
                <Icon size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
