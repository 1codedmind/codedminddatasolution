import { ArrowRight, BarChart3 } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <BarChart3 size={14} />
            Data Engineering & Analytics
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
            Build Reliable Data Systems That Power{" "}
            <span className="text-blue-600">Better Decisions</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl">
            We help businesses design data pipelines, automate reporting, build
            dashboards, and create custom data products using modern engineering
            and cloud technologies.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Book a Consultation
              <ArrowRight size={16} />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "50+", label: "Data pipelines delivered" },
            { value: "3x", label: "Faster reporting cycles" },
            { value: "99%", label: "Pipeline uptime achieved" },
            { value: "10+", label: "Cloud platforms supported" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
