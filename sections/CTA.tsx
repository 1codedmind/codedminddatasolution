import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end">

          {/* Left */}
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.07]">
              Let&apos;s build your
              <br />
              data solution.
            </h2>
            <p className="mt-6 text-stone-400 text-base leading-relaxed max-w-md">
              From automated reporting to cloud data pipelines and custom
              analytics tools — we help businesses turn data into action.
              No commitment required.
            </p>
          </div>

          {/* Right — actions */}
          <div className="flex flex-col gap-3">
            <a
              href="mailto:hr@codedmind.co.in"
              className="group flex items-center justify-between px-6 py-5 bg-white text-stone-900 rounded-xl hover:bg-amber-50 transition"
            >
              <div>
                <p className="text-sm font-semibold">Email us directly</p>
                <p className="text-xs text-stone-400 mt-0.5">hr@codedmind.co.in</p>
              </div>
              <ArrowRight size={16} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              href="/careers"
              className="group flex items-center justify-between px-6 py-5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
            >
              <div>
                <p className="text-sm font-semibold">View current openings</p>
                <p className="text-xs text-amber-200 mt-0.5">Join our data engineering team</p>
              </div>
              <ArrowRight size={16} className="text-amber-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bottom rule */}
        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-stone-600">
          <p>Available for remote projects worldwide</p>
          <p>Built with precision. Powered by data.</p>
        </div>

      </div>
    </section>
  );
}
