"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Sparkles, Lock, Zap } from "lucide-react";
import Link from "next/link";
import * as pdfjsLib from "pdfjs-dist";
import { useResumeStore } from "@/store/resumeStore";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ── Types ──────────────────────────────────────────────────────────────────

interface UsageResponse {
  loggedIn: false;
}
interface UsageResponseAuthed {
  loggedIn: true;
  user: { email: string };
  plan: "free" | "pro" | "internal";
  usage: { today: number; week: number };
  limits: { daily: number | null; weekly: number | null };
}
type UsageData = UsageResponse | UsageResponseAuthed;

interface ExtractedData {
  personalInfo: {
    fullName?: string; jobTitle?: string; email?: string;
    phone?: string; location?: string; linkedin?: string; website?: string;
  };
  summary?: string;
  experience: Array<{
    title?: string; company?: string; location?: string;
    startDate?: string; endDate?: string; current?: boolean; bullets?: string[];
  }>;
  education: Array<{
    institution?: string; degree?: string; field?: string;
    location?: string; startDate?: string; endDate?: string; gpa?: string;
  }>;
  skills: string[];
  certifications: Array<{ name?: string; issuer?: string; date?: string }>;
  languages: Array<{ name?: string; level?: string }>;
}

// ── PDF helpers ────────────────────────────────────────────────────────────

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }
  return text;
}

function parseResumeTextLocally(text: string): ExtractedData {
  const data: ExtractedData = { personalInfo: {}, experience: [], education: [], skills: [], certifications: [], languages: [] };
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) data.personalInfo.email = emailMatch[0];
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) data.personalInfo.phone = phoneMatch[0];
  const nameMatch = text.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/m);
  if (nameMatch) data.personalInfo.fullName = nameMatch[0];
  const expMatch = text.match(/(?:experience|work history|employment)([\s\S]*?)(?=education|skills|$)/i);
  if (expMatch?.[1]) {
    expMatch[1].split(/[\n•]/).forEach((job) => {
      if (job.trim().length > 10) {
        const m = job.match(/^([^-•]+)-?\s*([^,•]+)/);
        if (m) data.experience.push({ title: m[1].trim(), company: m[2].trim(), bullets: [] });
      }
    });
  }
  const eduMatch = text.match(/(?:education|degree)([\s\S]*?)(?=skills|experience|$)/i);
  if (eduMatch?.[1]) {
    eduMatch[1].split(/[\n•]/).forEach((school) => {
      if (school.trim().length > 5) {
        const entry: ExtractedData["education"][0] = {};
        const dm = school.match(/([A-Z][a-z]+)\s+(?:in|of)?\s*([^,•]+)/i);
        if (dm) { entry.degree = dm[1]; entry.field = dm[2].trim(); }
        const um = school.match(/^([A-Z][^,•]+)/);
        if (um) entry.institution = um[1].trim();
        if (entry.institution || entry.degree) data.education.push(entry);
      }
    });
  }
  const skillsMatch = text.match(/skills?([\s\S]*?)(?=education|experience|certification|$)/i);
  if (skillsMatch?.[1]) {
    data.skills = skillsMatch[1].split(/[,•\n]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 50).slice(0, 20);
  }
  return data;
}

async function parseResumeWithAI(text: string): Promise<ExtractedData> {
  const res = await fetch("/api/resume/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (res.status === 401) throw Object.assign(new Error("UNAUTHENTICATED"), { code: "UNAUTHENTICATED" });
  if (res.status === 429) {
    const data = await res.json();
    throw Object.assign(new Error(data.code ?? "LIMIT"), { code: data.code ?? "LIMIT" });
  }
  if (!res.ok) throw new Error("AI parsing failed");
  const parsed = await res.json();
  return {
    personalInfo: parsed.personalInfo ?? {},
    summary: parsed.summary,
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
    languages: Array.isArray(parsed.languages) ? parsed.languages : [],
  };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ResumeUpload() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data, updatePersonalInfo, updateSummary,
    addExperience, updateExperience, removeExperience,
    addExperienceBullet, updateExperienceBullet,
    addEducation, updateEducation, removeEducation,
    addSkill, updateSkill, removeSkill,
    addCertification, updateCertification, removeCertification,
    addLanguage, updateLanguage, removeLanguage,
  } = useResumeStore();

  // Fetch usage on mount
  useEffect(() => {
    fetch("/api/resume/usage")
      .then((r) => r.json())
      .then((d) => setUsageData(d as UsageData))
      .catch(() => setUsageData({ loggedIn: false }));
  }, [extractedData]); // re-check after a successful upload to update counts

  async function handleFileSelect(selectedFile: File | null) {
    if (!selectedFile) return;
    if (!selectedFile.type.includes("pdf")) { setError("Please upload a PDF file"); return; }
    setLoading(true);
    setError("");
    setUsedFallback(false);
    try {
      const text = await extractTextFromPDF(selectedFile);
      if (!text.trim()) { setError("No readable text in this PDF. It may be a scanned image."); return; }
      try {
        setExtractedData(await parseResumeWithAI(text));
      } catch (err: any) {
        if (err.code === "UNAUTHENTICATED" || err.code === "DAILY_LIMIT" || err.code === "WEEKLY_LIMIT") {
          setError(err.message);
          // Refresh usage data so the gate UI updates
          fetch("/api/resume/usage").then((r) => r.json()).then((d) => setUsageData(d as UsageData));
          return;
        }
        // Network/model failure — fall back to local regex parsing
        setExtractedData(parseResumeTextLocally(text));
        setUsedFallback(true);
      }
    } catch (err) {
      setError("Failed to read PDF. Please try another file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function applyExtractedData() {
    if (!extractedData) return;

    // LLMs sometimes return "undefined", "null", "N/A" etc. as literal strings.
    // Strip them so they don't render in the template.
    const JUNK = new Set(["undefined", "null", "n/a", "none", "-", "—", "--", "na"]);
    function clean(v?: string | null): string {
      if (!v || typeof v !== "string") return "";
      const s = v.trim();
      return JUNK.has(s.toLowerCase()) ? "" : s;
    }
    // Dates: additionally strip "Present"/"Current" — the `current` boolean handles that
    function cleanDate(v?: string | null): string {
      const s = clean(v);
      return s.toLowerCase() === "present" || s.toLowerCase() === "current" ? "" : s;
    }

    updatePersonalInfo({
      fullName: clean(extractedData.personalInfo.fullName),
      jobTitle: clean(extractedData.personalInfo.jobTitle),
      email: clean(extractedData.personalInfo.email),
      phone: clean(extractedData.personalInfo.phone),
      location: clean(extractedData.personalInfo.location),
      linkedin: clean(extractedData.personalInfo.linkedin),
      website: clean(extractedData.personalInfo.website),
    });
    if (extractedData.summary) updateSummary(clean(extractedData.summary));

    data.experience.forEach((e) => removeExperience(e.id));
    extractedData.experience.forEach((exp) => {
      addExperience();
      const s = useResumeStore.getState();
      const newExp = s.data.experience[s.data.experience.length - 1];
      if (!newExp) return;
      updateExperience(newExp.id, {
        title: clean(exp.title),
        company: clean(exp.company),
        location: clean(exp.location),
        startDate: cleanDate(exp.startDate),
        endDate: cleanDate(exp.endDate),
        current: exp.current ?? false,
      });
      (exp.bullets ?? []).map((b) => b.trim()).filter(Boolean).forEach((bullet, idx) => {
        addExperienceBullet(newExp.id);
        updateExperienceBullet(newExp.id, idx, bullet);
      });
    });

    data.education.forEach((e) => removeEducation(e.id));
    extractedData.education.forEach((edu) => {
      addEducation();
      const s = useResumeStore.getState();
      const newEdu = s.data.education[s.data.education.length - 1];
      if (!newEdu) return;
      updateEducation(newEdu.id, {
        institution: clean(edu.institution),
        degree: clean(edu.degree),
        field: clean(edu.field),
        location: clean(edu.location),
        startDate: cleanDate(edu.startDate),
        endDate: cleanDate(edu.endDate),
        gpa: clean(edu.gpa),
      });
    });

    data.skills.forEach((s) => removeSkill(s.id));
    extractedData.skills.forEach((skill) => {
      const s = clean(skill);
      if (!s) return;
      addSkill();
      const st = useResumeStore.getState();
      const newSkill = st.data.skills[st.data.skills.length - 1];
      if (newSkill) updateSkill(newSkill.id, { name: s, level: 4 });
    });

    data.certifications.forEach((c) => removeCertification(c.id));
    extractedData.certifications.forEach((cert) => {
      if (!clean(cert.name)) return;
      addCertification();
      const s = useResumeStore.getState();
      const newCert = s.data.certifications[s.data.certifications.length - 1];
      if (newCert) updateCertification(newCert.id, { name: clean(cert.name), issuer: clean(cert.issuer), date: cleanDate(cert.date) });
    });

    data.languages.forEach((l) => removeLanguage(l.id));
    extractedData.languages.forEach((lang) => {
      if (!clean(lang.name)) return;
      addLanguage();
      const s = useResumeStore.getState();
      const newLang = s.data.languages[s.data.languages.length - 1];
      if (newLang) updateLanguage(newLang.id, { name: clean(lang.name), level: clean(lang.level) || "Fluent" });
    });

    setExtractedData(null);
    setError("");
  }

  // ── Loading state (fetching usage) ────────────────────────────────────────
  if (!usageData) {
    return (
      <div className="h-16 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!usageData.loggedIn) {
    return (
      <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center shrink-0 mt-0.5">
            <Lock size={15} className="text-stone-500" />
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Sign in to upload your resume</p>
            <p className="text-xs text-stone-500 mt-0.5">AI extracts your data — free account gets 3 uploads/day.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/signup"
            className="flex-1 text-center px-3 py-2 bg-stone-900 text-white text-xs font-bold rounded-lg hover:bg-stone-700 transition-colors"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="flex-1 text-center px-3 py-2 bg-white text-stone-700 border border-stone-200 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Logged-in usage info ───────────────────────────────────────────────────
  const { plan, usage, limits } = usageData;
  const dailyUsed = usage.today;
  const weeklyUsed = usage.week;
  const dailyExhausted = limits.daily !== null && dailyUsed >= limits.daily;
  const weeklyExhausted = limits.weekly !== null && weeklyUsed >= limits.weekly;
  const isLimited = dailyExhausted || weeklyExhausted;

  // ── Limit reached ─────────────────────────────────────────────────────────
  if (isLimited) {
    const message = dailyExhausted
      ? `Daily limit reached — ${limits.daily}/${limits.daily} uploads used today.`
      : `Weekly limit reached — ${limits.weekly}/${limits.weekly} uploads used this week.`;
    const resetNote = dailyExhausted ? "Resets tomorrow at midnight." : "Resets in 7 days.";
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={15} className="text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">{message}</p>
            <p className="text-xs text-amber-700 mt-0.5">{resetNote}</p>
          </div>
        </div>
        <div className="p-3 bg-white rounded-lg border border-amber-200">
          <p className="text-xs font-bold text-stone-800 mb-1">Upgrade to Pro</p>
          <p className="text-xs text-stone-500">50 uploads/day · Unlimited weekly · Premium templates</p>
          <button
            disabled
            className="mt-2 w-full px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg opacity-60 cursor-not-allowed"
          >
            Coming soon
          </button>
        </div>
      </div>
    );
  }

  // ── Confirm extracted data ────────────────────────────────────────────────
  if (extractedData) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <div className="flex items-start gap-3">
          {usedFallback
            ? <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
            : <Sparkles size={20} className="text-blue-600 mt-0.5 shrink-0" />
          }
          <div className="flex-1">
            <p className="font-semibold text-blue-900">
              {usedFallback ? "Data extracted (basic mode)" : "AI extracted your resume data"}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {extractedData.personalInfo.fullName || "Name"} · {extractedData.experience.length} exp ·{" "}
              {extractedData.education.length} edu · {extractedData.skills.length} skills
              {extractedData.certifications.length > 0 && ` · ${extractedData.certifications.length} certs`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyExtractedData}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply to Resume
          </button>
          <button
            onClick={() => setExtractedData(null)}
            className="flex-1 px-4 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Upload zone (logged in, has quota) ────────────────────────────────────
  return (
    <div className="space-y-2">
      <div
        onClick={() => !loading && fileInputRef.current?.click()}
        className="p-5 border-2 border-dashed border-stone-300 rounded-lg hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
            <p className="text-xs text-stone-600">Reading & analysing PDF…</p>
          </div>
        ) : (
          <>
            <Upload size={22} className="mx-auto mb-2 text-stone-400" />
            <p className="font-semibold text-stone-700 text-sm">Upload existing resume (PDF)</p>
            <p className="text-xs text-stone-500 mt-1">AI extracts your data and fills the form</p>
          </>
        )}
      </div>

      {/* Quota badge */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-stone-400">
          {plan === "internal"
            ? "Unlimited AI uploads"
            : `${dailyUsed}/${limits.daily} AI uploads today${plan === "free" && limits.weekly !== null ? ` · ${weeklyUsed}/${limits.weekly} this week` : ""}`
          }
        </span>
        {plan === "free" && limits.daily !== null && (
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Free — {limits.daily - dailyUsed} left today
          </span>
        )}
        {plan === "pro" && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Pro
          </span>
        )}
        {plan === "internal" && (
          <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
            Internal
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={15} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
