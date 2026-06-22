import Link from "next/link";
import { Minimize2, Server, ArrowRight } from "lucide-react";
import { ToolShell } from "@/components/pdf/ToolShell";

// ─────────────────────────────────────────────────────────────────────────────
// Backend hook: when the server-side Ghostscript processor is ready,
// replace this page with the full tool UI.
// API route: app/api/pdf/compress/route.ts
// Processor:  lib/pdf/processors/server/compress.ts
// ─────────────────────────────────────────────────────────────────────────────

export default function CompressPDFPage() {
  return (
    <ToolShell
      title="Compress PDF"
      description="Reduce PDF file size significantly using server-side Ghostscript."
      icon={<Minimize2 size={22} />}
      badge="Coming soon"
    >
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-5">
          <Server size={24} className="text-sky-500" />
        </div>
        <p className="text-xl font-bold text-stone-900 mb-2">Server-side compression coming soon</p>
        <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-2">
          Unlike other tools on this page, high-quality PDF compression (60–80% reduction) requires
          Ghostscript running on a server. Browser-only compression only achieves ~10–20%.
        </p>
        <p className="text-sm text-stone-400 max-w-md mx-auto mb-8">
          We&apos;re building this properly. When it ships, your file will be compressed server-side
          and deleted immediately after download.
        </p>
        <Link
          href="/tools/pdf"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-rose-600 transition"
        >
          Back to PDF tools <ArrowRight size={14} />
        </Link>
      </div>
    </ToolShell>
  );
}
