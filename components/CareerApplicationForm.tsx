"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Mail, Upload } from "lucide-react";

type CareerApplicationFormProps = {
  roleTitle: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  college: string;
  degree: string;
  graduationYear: string;
  academicPerformance: string;
  skills: string;
  experience: string;
  whyJoin: string;
  resumeFileName: string;
};

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  college: "",
  degree: "",
  graduationYear: "",
  academicPerformance: "",
  skills: "",
  experience: "",
  whyJoin: "",
  resumeFileName: "",
};

export default function CareerApplicationForm({
  roleTitle,
}: CareerApplicationFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateResume = (event: ChangeEvent<HTMLInputElement>) => {
    const resumeFileName = event.target.files?.[0]?.name ?? "";

    setFormState((current) => ({
      ...current,
      resumeFileName,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = `Application: ${roleTitle} - ${formState.fullName}`;
    const body = [
      "Hello Coded Mind team,",
      "",
      `I would like to apply for the ${roleTitle} role.`,
      "",
      `Full Name: ${formState.fullName}`,
      `Email: ${formState.email}`,
      `Phone: ${formState.phone}`,
      `Current Location: ${formState.location}`,
      `College/University: ${formState.college}`,
      `Degree / Program: ${formState.degree}`,
      `Graduation Year: ${formState.graduationYear}`,
      `Academic Performance: ${formState.academicPerformance}%`,
      `Skills: ${formState.skills}`,
      "",
      "Relevant Experience / Projects:",
      formState.experience,
      "",
      "Why I am interested in this internship:",
      formState.whyJoin,
      "",
      `Resume selected for attachment: ${formState.resumeFileName || "Not selected"}`,
      "",
      "Please find my resume attached.",
    ].join("\n");

    window.location.href = `mailto:hr@codedmind.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Full Name
          </span>
          <input
            required
            name="fullName"
            value={formState.fullName}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Your full name"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Email Address
          </span>
          <input
            required
            type="email"
            name="email"
            value={formState.email}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Mobile Number
          </span>
          <input
            required
            name="phone"
            value={formState.phone}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="+91 9876543210"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Current Location
          </span>
          <input
            required
            name="location"
            value={formState.location}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="City, State"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            College / University
          </span>
          <input
            required
            name="college"
            value={formState.college}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Institution name"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Degree / Program
          </span>
          <input
            required
            name="degree"
            value={formState.degree}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="B.Tech, MCA, M.Sc, etc."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Graduation Year
          </span>
          <input
            required
            type="number"
            name="graduationYear"
            value={formState.graduationYear}
            onChange={updateField}
            min="2024"
            max="2035"
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="2026"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Academic Performance (%)
          </span>
          <input
            required
            type="number"
            name="academicPerformance"
            value={formState.academicPerformance}
            onChange={updateField}
            min="75"
            max="100"
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Minimum 75%"
          />
        </label>
      </div>

      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Core Skills
          </span>
          <input
            required
            name="skills"
            value={formState.skills}
            onChange={updateField}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Python, SQL, PySpark, AWS, Databricks"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Relevant Experience / Projects
          </span>
          <textarea
            required
            name="experience"
            value={formState.experience}
            onChange={updateField}
            rows={5}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Share internships, projects, coursework, or anything relevant."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Why do you want to join Coded Mind?
          </span>
          <textarea
            required
            name="whyJoin"
            value={formState.whyJoin}
            onChange={updateField}
            rows={5}
            className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-500 focus:bg-white"
            placeholder="Tell us what excites you about this internship."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Resume
          </span>
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4">
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <Upload size={16} className="text-amber-700" />
              <span>
                Choose your resume. Your email app will open on submit and you
                can attach this file before sending.
              </span>
            </div>
            <input
              required
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={updateResume}
              className="mt-4 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-medium file:text-amber-900 hover:file:bg-amber-200"
            />
            <p className="mt-3 text-xs text-stone-500">
              {formState.resumeFileName
                ? `Selected resume: ${formState.resumeFileName}`
                : "Accepted formats: PDF, DOC, DOCX"}
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-stone-700">
        This sends your application details to hr@codedmind.co.in through your
        default mail app. Please attach the selected resume before sending the
        email.
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
      >
        <Mail size={16} />
        Email Application
      </button>
    </form>
  );
}
