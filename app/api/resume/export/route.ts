import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import type { ResumeData, ResumeConfig } from "@/lib/resume/types";
import ModernPDF from "@/components/resume-builder/templates/pdf/ModernPDF";
import ClassicPDF from "@/components/resume-builder/templates/pdf/ClassicPDF";
import MinimalPDF from "@/components/resume-builder/templates/pdf/MinimalPDF";
import ExecutivePDF from "@/components/resume-builder/templates/pdf/ExecutivePDF";
import CreativePDF from "@/components/resume-builder/templates/pdf/CreativePDF";
import CompactPDF from "@/components/resume-builder/templates/pdf/CompactPDF";
import SharpPDF from "@/components/resume-builder/templates/pdf/SharpPDF";
import ElegantPDF from "@/components/resume-builder/templates/pdf/ElegantPDF";
import CascadePDF from "@/components/resume-builder/templates/pdf/CascadePDF";
import CubicPDF from "@/components/resume-builder/templates/pdf/CubicPDF";
import NanicaPDF from "@/components/resume-builder/templates/pdf/NanicaPDF";
import EnfoldPDF from "@/components/resume-builder/templates/pdf/EnfoldPDF";

const PDF_COMPONENTS = {
  modern:    ModernPDF,
  classic:   ClassicPDF,
  minimal:   MinimalPDF,
  executive: ExecutivePDF,
  creative:  CreativePDF,
  compact:   CompactPDF,
  sharp:     SharpPDF,
  elegant:   ElegantPDF,
  cascade:   CascadePDF,
  cubic:     CubicPDF,
  nanica:    NanicaPDF,
  enfold:    EnfoldPDF,
};

// Server-side PDF rendering is expensive in both CPU and memory, and this
// endpoint is public by design (the resume builder needs no account). These
// limits keep it from becoming a cheap way to burn the function budget.
const MAX_BODY_BYTES = 256 * 1024;
const MAX_SECTION_ITEMS = 100;
const MAX_BULLETS_PER_ITEM = 50;

/**
 * Minimal shape check. Without it a malformed body reaches the PDF renderer
 * and surfaces as an opaque 500; callers deserve a 400 that says what is wrong.
 */
function isPayloadWellFormed(data: ResumeData): boolean {
  if (typeof data.personalInfo !== "object" || data.personalInfo === null) return false;
  if (typeof data.personalInfo.fullName !== "string") return false;

  const requiredArrays: Array<keyof ResumeData> = [
    "experience",
    "education",
    "skills",
    "certifications",
    "projects",
    "languages",
    "customSections",
    "sectionOrder",
  ];

  return requiredArrays.every((field) => Array.isArray(data[field]));
}

/** Reject payloads that are structurally huge rather than merely long. */
function isPayloadOversized(data: ResumeData): boolean {
  const lists = [
    data.experience,
    data.education,
    data.skills,
    data.certifications,
    data.projects,
    data.languages,
    data.customSections,
  ];

  for (const list of lists) {
    if (Array.isArray(list) && list.length > MAX_SECTION_ITEMS) return true;
  }

  for (const role of data.experience ?? []) {
    if (Array.isArray(role.bullets) && role.bullets.length > MAX_BULLETS_PER_ITEM) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // 20 exports per minute is far above normal use — a person clicks download a
  // handful of times while tweaking a template.
  if (!(await enforceRateLimit(`resume-export:${ip}`, 20, 60_000))) {
    return NextResponse.json({ error: "Too many exports. Please slow down." }, { status: 429 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Resume data is too large." }, { status: 413 });
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Resume data is too large." }, { status: 413 });
    }

    const body = JSON.parse(raw) as { data: ResumeData; config: ResumeConfig };
    const { data, config } = body;

    if (!data || !config || !data.personalInfo) {
      return NextResponse.json({ error: "Missing data or config" }, { status: 400 });
    }

    if (!isPayloadWellFormed(data)) {
      return NextResponse.json({ error: "Resume data is missing required fields." }, { status: 400 });
    }

    if (isPayloadOversized(data)) {
      return NextResponse.json({ error: "Resume has too many entries to render." }, { status: 413 });
    }

    const Component = PDF_COMPONENTS[config.template] ?? ModernPDF;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(Component, { data, color: config.accentColor, fontFamily: config.fontFamily }) as any;
    const buffer = await renderToBuffer(element);
    const uint8 = new Uint8Array(buffer);

    // Strip anything that could break out of the quoted header value.
    const name =
      data.personalInfo.fullName.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 60) ||
      "Resume";

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}_Resume.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[resume/export]", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
