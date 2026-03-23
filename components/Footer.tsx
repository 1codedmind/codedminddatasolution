import Link from "next/link";
import { Database, Mail, MapPin } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "About", href: "/#why-us" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/#cta" },
];

const services = [
  "Data Engineering",
  "Cloud Data Solutions",
  "Reporting & Dashboards",
  "Data Automation",
  "Custom Data Products",
];

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-stone-800">
          {/* Brand column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-600">
                <Database size={15} className="text-white" />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">
                Coded Mind{" "}
                <span className="text-amber-400">Data Solution</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              We help businesses design data pipelines, automate reporting, and
              build custom data products using modern cloud technologies.
            </p>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <MapPin size={13} />
              Available for remote projects worldwide
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 md:col-start-6">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">
              Services
            </h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/#services"
                    className="text-sm text-stone-400 hover:text-white transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2 md:col-start-11">
            <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-4">
              Contact
            </h4>
            <a
              href="mailto:hr@codedmind.co.in"
              className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors"
            >
              <Mail size={13} />
              hr@codedmind.co.in
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600">
          <p>
            &copy; {new Date().getFullYear()} Coded Mind Data Solution. All
            rights reserved.
          </p>
          <p>Built with precision. Powered by data.</p>
        </div>
      </div>
    </footer>
  );
}
