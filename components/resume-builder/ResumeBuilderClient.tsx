"use client";

import dynamic from "next/dynamic";

const ResumeEditor = dynamic(
  () => import("@/components/resume-builder/ResumeEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          <p className="text-sm text-stone-400">Loading editor…</p>
        </div>
      </div>
    ),
  }
);

export default function ResumeBuilderClient() {
  return <ResumeEditor />;
}
