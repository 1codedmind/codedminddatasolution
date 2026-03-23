import { ArrowRight, BarChart3 } from "lucide-react";

const stats = [
  { value: "50+", label: "Data pipelines delivered" },
  { value: "3×", label: "Faster reporting cycles" },
  { value: "99%", label: "Pipeline uptime achieved" },
  { value: "10+", label: "Cloud platforms supported" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fcfaf6]">
      {/* Subtle radial gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(217,119,6,0.12),transparent)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <BarChart3 size={13} />
            Data Engineering &amp; Analytics
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold text-slate-900 leading-[1.06] tracking-tight">
            Build Reliable Data Systems
            <br className="hidden sm:block" />
            That Power{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600">
              Better Decisions
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl">
            We help businesses design data pipelines, automate reporting, build
            dashboards, and create custom data products using modern engineering
            and cloud technologies.
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <a
              href="#cta"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-amber-600 rounded-full hover:bg-amber-700 transition-all shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-200 hover:-translate-y-px"
            >
              Book a Consultation
              <ArrowRight size={15} />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-full hover:border-stone-300 hover:bg-stone-50 transition-all"
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 pt-10 border-t border-stone-200/70">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={i > 0 ? "md:border-l md:border-stone-200/70 md:pl-10" : ""}
              >
                <p className="text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
