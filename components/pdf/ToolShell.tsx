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
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/tools/pdf" className="text-sm text-stone-400 hover:text-stone-700 transition">
        ← PDF Tools
      </Link>

      <div className="mt-5 mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-stone-500 mt-1 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {children}

      <p className="text-xs text-stone-400 text-center mt-10">
        Files are processed entirely in your browser · Never uploaded to any server · Free forever
      </p>
    </main>
  );
}
