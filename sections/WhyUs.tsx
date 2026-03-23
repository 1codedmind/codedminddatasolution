import {
  Layers,
  Target,
  CloudCog,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";

const reasons = [
  {
    icon: Layers,
    title: "Scalable Architecture Mindset",
    description:
      "We design systems built to grow — from thousands of records today to billions tomorrow, without rewriting from scratch.",
  },
  {
    icon: Target,
    title: "Business-Focused Implementation",
    description:
      "Every technical decision is tied to a business outcome. We build what creates value, not what looks impressive.",
  },
  {
    icon: CloudCog,
    title: "Cloud & Automation Expertise",
    description:
      "Deep hands-on experience with leading cloud platforms and automation tools to modernise your data operations.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable & Maintainable Systems",
    description:
      "Clean code, proper documentation, and tested pipelines you can hand to your team with confidence.",
  },
  {
    icon: TrendingUp,
    title: "Performance-Driven Engineering",
    description:
      "We benchmark, profile, and optimise — ensuring your pipelines run fast and your queries return results in seconds.",
  },
  {
    icon: Wrench,
    title: "Custom-Built Solutions",
    description:
      "No one-size-fits-all templates. Every solution is designed around your data, your stack, and your goals.",
  },
];

export default function WhyUs() {
  return (
    /* Dark section for strong visual contrast */
    <section id="why-us" className="bg-stone-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3">
            Why Choose Us
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Engineering You Can Rely On
          </h2>
          <p className="mt-4 text-stone-300 text-lg leading-relaxed">
            We combine technical depth with business clarity to deliver data
            systems that work in the real world.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-stone-800/60 border border-stone-700/60 rounded-2xl p-6 hover:bg-stone-800 hover:border-amber-500/40 transition-all duration-200"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-stone-700 text-amber-300 mb-5 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200">
                <Icon size={20} />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
