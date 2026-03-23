const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We start by understanding your business goals, existing data infrastructure, and the specific problems you need to solve.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "We architect a solution tailored to your stack — choosing the right tools, patterns, and data models before writing a single line of code.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We develop, test, and deploy your data pipelines, dashboards, or products with clean, well-documented, production-ready code.",
  },
  {
    number: "04",
    title: "Optimize",
    description:
      "Post-delivery, we monitor performance, gather feedback, and continuously improve your systems to grow with your business.",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-[#f6f1e8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-3">
            Our Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            How We Work
          </h2>
          <p className="mt-4 text-stone-600 text-lg leading-relaxed">
            A structured, transparent approach that keeps you informed and in
            control at every stage.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map(({ number, title, description }) => (
            <div
              key={number}
              className="relative bg-white rounded-2xl p-7 border border-stone-200/80 shadow-sm"
            >
              {/* Large number — decorative */}
              <p className="text-5xl font-black text-stone-300 leading-none mb-4 select-none">
                {number}
              </p>
              {/* Step indicator dot */}
              <div className="w-2 h-2 rounded-full bg-amber-600 mb-4" />
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
