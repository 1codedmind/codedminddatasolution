import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#fcfaf6] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold mb-7">
            Tools + Services
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-stone-900 leading-[1.06] tracking-tight">
            Tools for developers.
            <br />
            <span className="text-amber-600">Data systems</span> for
            <br />
            your business.
          </h1>

          <p className="mt-7 text-lg text-stone-600 leading-relaxed max-w-xl">
            Free developer tools that run in your browser — no login, no data sent.
            And when you need custom data pipelines, dashboards, or cloud
            infrastructure, we build those too.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition shadow-sm"
            >
              Explore Tools
              <ArrowRight size={14} />
            </Link>
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
            >
              Work with us
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-10 border-t border-stone-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10">
            {[
              { value: "7+", label: "Free tools available" },
              { value: "50+", label: "Data pipelines delivered" },
              { value: "99%", label: "Pipeline uptime achieved" },
              { value: "10+", label: "Cloud platforms supported" },
            ].map((stat, i) => (
              <div key={stat.label} className={i > 0 ? "md:border-l md:border-stone-200 md:pl-12" : ""}>
                <p className="text-4xl md:text-5xl font-extrabold text-stone-900 tabular-nums tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
