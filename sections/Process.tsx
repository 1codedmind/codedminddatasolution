const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We understand your business goals, existing infrastructure, and the specific problems you need to solve — before writing a line of code.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "We architect a solution tailored to your stack — right tools, right patterns, right data models.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We develop, test, and deploy with clean, well-documented, production-ready code.",
  },
  {
    number: "04",
    title: "Optimize",
    description:
      "We monitor performance and continuously improve your systems as your business grows.",
  },
];

export default function Process() {
  return (
    <section id="process" className="bg-[#f6f1e8] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            How we work
          </h2>
          <p className="text-stone-500 text-base max-w-xs md:text-right leading-relaxed">
            Structured and transparent — you know exactly where things stand at
            every stage.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal connector — desktop */}
          <div
            className="hidden lg:block absolute top-[1.375rem] h-px bg-stone-300"
            style={{ left: "4rem", right: "4rem" }}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map(({ number, title, description }, i) => (
              <div key={number} className="relative flex lg:flex-col gap-6 lg:gap-0">
                {/* Mobile vertical connector */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden absolute left-[1.375rem] top-12 bottom-0 w-px bg-stone-300" />
                )}
                {/* Circle */}
                <div className="relative z-10 shrink-0 flex items-center justify-center w-11 h-11 rounded-full border-2 border-stone-300 bg-[#f6f1e8] lg:mb-8">
                  <span className="text-xs font-extrabold text-amber-700 tabular-nums">{number}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900 mb-2">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
