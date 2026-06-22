import Link from "next/link";
import type { ReactNode } from "react";

interface ToolShellProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  badge?: string;
}

export function ToolShell({ title, description, icon, children, badge }: ToolShellProps) {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Breadcrumb */}
        <Link
          href="/tools/pdf"
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-stone-700 transition mb-8"
        >
          ← PDF Tools
        </Link>

        {/* Tool header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
                {title}
              </h1>
              {badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-stone-400 mt-1 text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        {children}

        <p className="text-xs text-stone-400 text-center mt-10">
          Processed entirely in your browser · Never uploaded · Free forever
        </p>

      </div>
    </main>
  );
}
