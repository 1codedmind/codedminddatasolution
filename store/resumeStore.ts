"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

function uuid() { return globalThis.crypto.randomUUID(); }
import type {
  ResumeData,
  ResumeConfig,
  TemplateName,
  FontOption,
  SectionName,
  Experience,
  Education,
  Skill,
  Certification,
  Project,
  Language,
  CustomSection,
  CustomSectionItem,
} from "@/lib/resume/types";
import { sampleResume } from "@/lib/resume/defaults";

interface ResumeStore {
  data: ResumeData;
  config: ResumeConfig;
  activeSection: string | null;
  isDownloading: boolean;

  // Config
  setTemplate: (t: TemplateName) => void;
  setAccentColor: (c: string) => void;

  // Navigation
  setActiveSection: (s: string | null) => void;

  // Personal Info
  updatePersonalInfo: (patch: Partial<ResumeData["personalInfo"]>) => void;

  // Summary
  updateSummary: (text: string) => void;

  // Experience
  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<Experience>) => void;
  addExperienceBullet: (id: string) => void;
  updateExperienceBullet: (id: string, idx: number, text: string) => void;
  removeExperienceBullet: (id: string, idx: number) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (ids: string[]) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<Education>) => void;
  addEducationBullet: (id: string) => void;
  updateEducationBullet: (id: string, idx: number, text: string) => void;
  removeEducationBullet: (id: string, idx: number) => void;
  removeEducation: (id: string) => void;

  // Skills
  addSkill: () => void;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  removeSkill: (id: string) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // Projects
  addProject: () => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  addProjectBullet: (id: string) => void;
  updateProjectBullet: (id: string, idx: number, text: string) => void;
  removeProjectBullet: (id: string, idx: number) => void;
  removeProject: (id: string) => void;

  // Languages
  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<Language>) => void;
  removeLanguage: (id: string) => void;

  // Section order
  reorderSections: (order: string[]) => void;
  addSection: (section: SectionName) => void;
  removeSection: (section: SectionName) => void;

  // Custom sections
  addCustomSection: (title: string) => void;
  removeCustomSection: (id: string) => void;
  renameCustomSection: (id: string, title: string) => void;
  addCustomSectionItem: (sectionId: string) => void;
  updateCustomSectionItem: (sectionId: string, itemId: string, patch: Partial<CustomSectionItem>) => void;
  removeCustomSectionItem: (sectionId: string, itemId: string) => void;
  addCustomSectionItemBullet: (sectionId: string, itemId: string) => void;
  updateCustomSectionItemBullet: (sectionId: string, itemId: string, idx: number, text: string) => void;
  removeCustomSectionItemBullet: (sectionId: string, itemId: string, idx: number) => void;

  // Config extras
  setFontScale: (scale: number) => void;
  setFontFamily: (family: FontOption) => void;

  // Download
  setIsDownloading: (v: boolean) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
  data: sampleResume(),
  config: { template: "modern", accentColor: "#1d4ed8", fontScale: 1, fontFamily: "inter" },
  activeSection: null,
  isDownloading: false,

  setTemplate: (t) => set((s) => ({ config: { ...s.config, template: t } })),
  setAccentColor: (c) => set((s) => ({ config: { ...s.config, accentColor: c } })),

  setActiveSection: (section) =>
    set((s) => ({ activeSection: s.activeSection === section ? null : section })),

  updatePersonalInfo: (patch) =>
    set((s) => ({ data: { ...s.data, personalInfo: { ...s.data.personalInfo, ...patch } } })),

  updateSummary: (text) => set((s) => ({ data: { ...s.data, summary: text } })),

  addExperience: () =>
    set((s) => ({
      data: {
        ...s.data,
        experience: [
          ...s.data.experience,
          {
            id: uuid(),
            company: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""],
          },
        ],
      },
    })),

  updateExperience: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: s.data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    })),

  addExperienceBullet: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: s.data.experience.map((e) =>
          e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e
        ),
      },
    })),

  updateExperienceBullet: (id, idx, text) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: s.data.experience.map((e) => {
          if (e.id !== id) return e;
          const bullets = [...e.bullets];
          bullets[idx] = text;
          return { ...e, bullets };
        }),
      },
    })),

  removeExperienceBullet: (id, idx) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: s.data.experience.map((e) =>
          e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
        ),
      },
    })),

  removeExperience: (id) =>
    set((s) => ({
      data: { ...s.data, experience: s.data.experience.filter((e) => e.id !== id) },
    })),

  reorderExperience: (ids) =>
    set((s) => ({
      data: {
        ...s.data,
        experience: ids.map((id) => s.data.experience.find((e) => e.id === id)!),
      },
    })),

  addEducation: () =>
    set((s) => ({
      data: {
        ...s.data,
        education: [
          ...s.data.education,
          {
            id: uuid(),
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
            bullets: [],
          },
        ],
      },
    })),

  updateEducation: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    })),

  addEducationBullet: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education.map((e) =>
          e.id === id ? { ...e, bullets: [...e.bullets, ""] } : e
        ),
      },
    })),

  updateEducationBullet: (id, idx, text) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education.map((e) => {
          if (e.id !== id) return e;
          const bullets = [...e.bullets];
          bullets[idx] = text;
          return { ...e, bullets };
        }),
      },
    })),

  removeEducationBullet: (id, idx) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education.map((e) =>
          e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
        ),
      },
    })),

  removeEducation: (id) =>
    set((s) => ({
      data: { ...s.data, education: s.data.education.filter((e) => e.id !== id) },
    })),

  addSkill: () =>
    set((s) => ({
      data: {
        ...s.data,
        skills: [...s.data.skills, { id: uuid(), name: "", level: 3 }],
      },
    })),

  updateSkill: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        skills: s.data.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk)),
      },
    })),

  removeSkill: (id) =>
    set((s) => ({
      data: { ...s.data, skills: s.data.skills.filter((sk) => sk.id !== id) },
    })),

  addCertification: () =>
    set((s) => ({
      data: {
        ...s.data,
        certifications: [
          ...s.data.certifications,
          { id: uuid(), name: "", issuer: "", date: "", url: "" },
        ],
      },
    })),

  updateCertification: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        certifications: s.data.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      },
    })),

  removeCertification: (id) =>
    set((s) => ({
      data: { ...s.data, certifications: s.data.certifications.filter((c) => c.id !== id) },
    })),

  addProject: () =>
    set((s) => ({
      data: {
        ...s.data,
        projects: [
          ...s.data.projects,
          { id: uuid(), name: "", url: "", description: "", bullets: [""] },
        ],
      },
    })),

  updateProject: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        projects: s.data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      },
    })),

  addProjectBullet: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        projects: s.data.projects.map((p) =>
          p.id === id ? { ...p, bullets: [...p.bullets, ""] } : p
        ),
      },
    })),

  updateProjectBullet: (id, idx, text) =>
    set((s) => ({
      data: {
        ...s.data,
        projects: s.data.projects.map((p) => {
          if (p.id !== id) return p;
          const bullets = [...p.bullets];
          bullets[idx] = text;
          return { ...p, bullets };
        }),
      },
    })),

  removeProjectBullet: (id, idx) =>
    set((s) => ({
      data: {
        ...s.data,
        projects: s.data.projects.map((p) =>
          p.id === id ? { ...p, bullets: p.bullets.filter((_, i) => i !== idx) } : p
        ),
      },
    })),

  removeProject: (id) =>
    set((s) => ({
      data: { ...s.data, projects: s.data.projects.filter((p) => p.id !== id) },
    })),

  addLanguage: () =>
    set((s) => ({
      data: {
        ...s.data,
        languages: [...s.data.languages, { id: uuid(), name: "", level: "Fluent" }],
      },
    })),

  updateLanguage: (id, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        languages: s.data.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    })),

  removeLanguage: (id) =>
    set((s) => ({
      data: { ...s.data, languages: s.data.languages.filter((l) => l.id !== id) },
    })),

  reorderSections: (order) =>
    set((s) => ({ data: { ...s.data, sectionOrder: order } })),

  addSection: (section) =>
    set((s) => {
      if (s.data.sectionOrder.includes(section)) return s;
      return { data: { ...s.data, sectionOrder: [...s.data.sectionOrder, section] } };
    }),

  removeSection: (section) =>
    set((s) => ({
      data: { ...s.data, sectionOrder: s.data.sectionOrder.filter((k) => k !== section) },
    })),

  addCustomSection: (title) =>
    set((s) => {
      const id = uuid();
      return {
        data: {
          ...s.data,
          customSections: [...(s.data.customSections ?? []), { id, title, items: [] }],
          sectionOrder: [...s.data.sectionOrder, id],
        },
      };
    }),

  removeCustomSection: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).filter((cs) => cs.id !== id),
        sectionOrder: s.data.sectionOrder.filter((k) => k !== id),
      },
    })),

  renameCustomSection: (id, title) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === id ? { ...cs, title } : cs
        ),
      },
    })),

  addCustomSectionItem: (sectionId) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId
            ? { ...cs, items: [...cs.items, { id: uuid(), heading: "", subtitle: "", date: "", description: "", bullets: [] }] }
            : cs
        ),
      },
    })),

  updateCustomSectionItem: (sectionId, itemId, patch) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId
            ? { ...cs, items: cs.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
            : cs
        ),
      },
    })),

  removeCustomSectionItem: (sectionId, itemId) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId ? { ...cs, items: cs.items.filter((it) => it.id !== itemId) } : cs
        ),
      },
    })),

  addCustomSectionItemBullet: (sectionId, itemId) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId
            ? { ...cs, items: cs.items.map((it) => it.id === itemId ? { ...it, bullets: [...it.bullets, ""] } : it) }
            : cs
        ),
      },
    })),

  updateCustomSectionItemBullet: (sectionId, itemId, idx, text) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId
            ? {
                ...cs,
                items: cs.items.map((it) => {
                  if (it.id !== itemId) return it;
                  const bullets = [...it.bullets];
                  bullets[idx] = text;
                  return { ...it, bullets };
                }),
              }
            : cs
        ),
      },
    })),

  removeCustomSectionItemBullet: (sectionId, itemId, idx) =>
    set((s) => ({
      data: {
        ...s.data,
        customSections: (s.data.customSections ?? []).map((cs) =>
          cs.id === sectionId
            ? { ...cs, items: cs.items.map((it) => it.id === itemId ? { ...it, bullets: it.bullets.filter((_, i) => i !== idx) } : it) }
            : cs
        ),
      },
    })),

  setFontScale: (scale) => set((s) => ({ config: { ...s.config, fontScale: scale } })),
  setFontFamily: (family) => set((s) => ({ config: { ...s.config, fontFamily: family } })),

  setIsDownloading: (v) => set({ isDownloading: v }),
    }),
    {
      name: "resume-builder-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ data: state.data, config: state.config }),
    }
  )
);
