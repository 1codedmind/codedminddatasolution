const reasons = [
  {
    number: "01",
    title: "Scalable architecture mindset",
    description:
      "Systems built to grow — from thousands of records today to billions tomorrow, without a rewrite.",
  },
  {
    number: "02",
    title: "Business-focused implementation",
    description:
      "Every technical decision is tied to a business outcome. We build what creates value, not what looks good in a deck.",
  },
  {
    number: "03",
    title: "Cloud & automation expertise",
    description:
      "Deep hands-on experience with leading cloud platforms and modern automation tooling.",
  },
  {
    number: "04",
    title: "Reliable, maintainable systems",
    description:
      "Clean code, proper documentation, and tested pipelines your team can own and extend with confidence.",
  },
  {
    number: "05",
    title: "Performance-driven engineering",
    description:
      "We benchmark, profile, and optimise until your pipelines run fast and queries return in seconds.",
  },
  {
    number: "06",
    title: "Custom-built, not off-the-shelf",
    description:
      "No templates. Every solution is designed around your data, your stack, and your specific goals.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* Header row */}
        <div className="mb-16 pb-12 border-b border-stone-700">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Why clients
            <br />
            choose us
          </h2>
        </div>

        {/* 2-col text grid — no cards, just type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12">
          {reasons.map(({ number, title, description }) => (
            <div key={number} className="py-8 border-b border-stone-800 last:border-0">
              <span className="block text-3xl font-black text-stone-700 tabular-nums mb-5 leading-none select-none">
                {number}
              </span>
              <h3 className="text-[15px] font-semibold text-stone-100 mb-2">{title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
