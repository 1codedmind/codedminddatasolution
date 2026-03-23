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
    <section id="process" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
            Our Process
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            How We Work
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            A structured, transparent approach that keeps you informed and in
            control at every stage.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200 z-0" />

          {steps.map(({ number, title, description }) => (
            <div key={number} className="relative z-10 flex flex-col items-center text-center">
              {/* Step number bubble */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold mb-5 shadow-md">
                {number}
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
