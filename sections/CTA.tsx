import { ArrowRight, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA card with deep gradient background */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 px-8 py-16 md:px-16 md:py-20 text-center">
          {/* Decorative radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(245,158,11,0.22),transparent)]" />

          <div className="relative">
            {/* Eyebrow */}
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-4">
              Get Started
            </p>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5">
              Let&apos;s Build Your Data Solution
            </h2>

            {/* Body text */}
            <p className="text-stone-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              From automated reporting to cloud data pipelines and custom
              analytics tools, we help businesses turn data into action.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:hello@codedmind.io"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-stone-900 bg-white rounded-full hover:bg-amber-50 transition-all shadow-md"
              >
                <Mail size={15} />
                Get in Touch
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white border border-stone-500 rounded-full hover:border-amber-300 hover:bg-white/5 transition-all"
              >
                View Our Services
                <ArrowRight size={15} />
              </a>
            </div>

            {/* Trust note */}
            <p className="mt-8 text-stone-400 text-sm">
              No commitment required &mdash; let&apos;s start with a conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
