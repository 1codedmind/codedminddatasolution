import type { Metadata } from "next";
import ResumeBuilderClient from "@/components/resume-builder/ResumeBuilderClient";

export const metadata: Metadata = {
  title: "Free Resume Builder — Create a Professional Resume Online | Coded Mind",
  description:
    "Build a job-winning resume in minutes. Choose from 5 professional templates, customize colors, and download a high-quality PDF. 100% free, no signup required.",
  alternates: { canonical: "https://codedmind.co.in/tools/resume-builder" },
  openGraph: {
    title: "Free Resume Builder — Coded Mind",
    description: "Professional resume builder with 5 templates and instant PDF download.",
    url: "https://codedmind.co.in/tools/resume-builder",
  },
};

export default function ResumeBuilderPage() {
  return <ResumeBuilderClient />;
}
