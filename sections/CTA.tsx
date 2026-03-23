import { ArrowRight, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Let&apos;s Build Your Data Solution
        </h2>

        {/* Body text */}
        <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          From automated reporting to cloud data pipelines and custom analytics
          tools, we help businesses turn data into action.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:hello@codedmind.io"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Mail size={16} />
            Get in Touch
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white border border-blue-400 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Our Services
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Trust note */}
        <p className="mt-8 text-blue-200 text-sm">
          No commitment required &mdash; let&apos;s start with a conversation.
        </p>
      </div>
    </section>
  );
}
