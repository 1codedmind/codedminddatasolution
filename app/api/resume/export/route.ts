import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { data: ResumeData; config: ResumeConfig };
    const { data, config } = body;

    if (!data || !config) {
      return NextResponse.json({ error: "Missing data or config" }, { status: 400 });
    }

    const Component = PDF_COMPONENTS[config.template] ?? ModernPDF;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(Component, { data, color: config.accentColor, fontFamily: config.fontFamily }) as any;
    const buffer = await renderToBuffer(element);
    const uint8 = new Uint8Array(buffer);

    const name = data.personalInfo.fullName.trim().replace(/\s+/g, "_") || "Resume";

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
