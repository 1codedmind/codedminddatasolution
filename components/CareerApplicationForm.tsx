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

type FormErrors = Partial<Record<keyof FormState, string>>;

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

const MAX_RESUME_MB = 5;
const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

function validateForm(state: FormState): FormErrors {
  const errors: FormErrors = {};

  const name = state.fullName.trim();
  if (name.length < 3) {
    errors.fullName = "Enter your full name (at least 3 characters).";
  } else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(name)) {
    errors.fullName = "Name can only contain letters, spaces, and . ' -";
  }

  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(state.email.trim())) {
    errors.email = "Enter a valid email address (e.g. you@example.com).";
  }

  const phone = state.phone.replace(/[\s()-]/g, "");
  if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }

  if (state.location.trim().length < 2) {
    errors.location = "Enter your current city.";
  }

  if (state.college.trim().length < 3) {
    errors.college = "Enter your college or university name.";
  }

  if (state.degree.trim().length < 2) {
    errors.degree = "Enter your degree or program.";
  }

  const year = parseInt(state.graduationYear, 10);
  if (Number.isNaN(year) || year < 2024 || year > 2035) {
    errors.graduationYear = "Graduation year must be between 2024 and 2035.";
  }

  const perf = parseFloat(state.academicPerformance);
  if (Number.isNaN(perf) || perf < 0 || perf > 100) {
    errors.academicPerformance = "Enter your percentage (0–100).";
  } else if (perf < 75) {
    errors.academicPerformance = "A minimum of 75% is required for this role.";
  }

  if (state.skills.trim().length < 3) {
    errors.skills = "List at least one core skill.";
  }

  if (state.experience.trim().length < 30) {
    errors.experience = "Please share a little more detail (at least 30 characters).";
  }

  if (state.whyJoin.trim().length < 30) {
    errors.whyJoin = "Please share a little more detail (at least 30 characters).";
  }

  if (!state.resumeFileName) {
    errors.resumeFileName = "Select your resume file (PDF, DOC, or DOCX).";
  }

  return errors;
}

export default function CareerApplicationForm({
  roleTitle,
}: CareerApplicationFormProps) {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setFormState((current) => {
      const next = { ...current, [name]: value };
      // Re-validate live once the user has attempted a submit
      if (submitted) setErrors(validateForm(next));
      return next;
    });
  };

  const updateResume = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!RESUME_EXTENSIONS.includes(ext)) {
        setErrors((e) => ({ ...e, resumeFileName: "Only PDF, DOC, or DOCX files are accepted." }));
        event.target.value = "";
        setFormState((current) => ({ ...current, resumeFileName: "" }));
        return;
      }
      if (file.size > MAX_RESUME_MB * 1024 * 1024) {
        setErrors((e) => ({ ...e, resumeFileName: `Resume must be under ${MAX_RESUME_MB} MB.` }));
        event.target.value = "";
        setFormState((current) => ({ ...current, resumeFileName: "" }));
        return;
      }
    }

    setErrors((e) => ({ ...e, resumeFileName: undefined }));
    setFormState((current) => ({
      ...current,
      resumeFileName: file?.name ?? "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    const validationErrors = validateForm(formState);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // Scroll to the first errored field
      const firstField = Object.keys(validationErrors)[0];
      document.getElementsByName(firstField)[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

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

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-2xl border px-4 py-3 text-sm text-stone-900 outline-none transition focus:bg-white ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-stone-300 bg-stone-50 focus:border-amber-500"
    }`;

  const FieldError = ({ field }: { field: keyof FormState }) =>
    errors[field] ? (
      <p className="mt-1.5 text-xs text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
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
            className={inputCls("fullName")}
            placeholder="Your full name"
          />
          <FieldError field="fullName" />
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
            className={inputCls("email")}
            placeholder="you@example.com"
          />
          <FieldError field="email" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Mobile Number
          </span>
          <input
            required
            type="tel"
            name="phone"
            value={formState.phone}
            onChange={updateField}
            className={inputCls("phone")}
            placeholder="+91 9876543210"
          />
          <FieldError field="phone" />
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
            className={inputCls("location")}
            placeholder="City, State"
          />
          <FieldError field="location" />
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
            className={inputCls("college")}
            placeholder="Institution name"
          />
          <FieldError field="college" />
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
            className={inputCls("degree")}
            placeholder="B.Tech, MCA, M.Sc, etc."
          />
          <FieldError field="degree" />
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
            className={inputCls("graduationYear")}
            placeholder="2026"
          />
          <FieldError field="graduationYear" />
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
            className={inputCls("academicPerformance")}
            placeholder="Minimum 75%"
          />
          <FieldError field="academicPerformance" />
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
            className={inputCls("skills")}
            placeholder="Python, SQL, PySpark, AWS, Databricks"
          />
          <FieldError field="skills" />
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
            className={inputCls("experience")}
            placeholder="Share internships, projects, coursework, or anything relevant."
          />
          <FieldError field="experience" />
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
            className={inputCls("whyJoin")}
            placeholder="Tell us what excites you about this internship."
          />
          <FieldError field="whyJoin" />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Resume
          </span>
          <div className={`rounded-2xl border border-dashed p-4 ${
            errors.resumeFileName ? "border-red-400 bg-red-50" : "border-stone-300 bg-stone-50"
          }`}>
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
              name="resumeFileName"
              accept=".pdf,.doc,.docx"
              onChange={updateResume}
              className="mt-4 block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:font-medium file:text-amber-900 hover:file:bg-amber-200"
            />
            <p className="mt-3 text-xs text-stone-500">
              {formState.resumeFileName
                ? `Selected resume: ${formState.resumeFileName}`
                : `Accepted formats: PDF, DOC, DOCX · Max ${MAX_RESUME_MB} MB`}
            </p>
            <FieldError field="resumeFileName" />
          </div>
        </label>
      </div>

      {submitted && Object.keys(errors).length > 0 && (
        <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Please fix the highlighted fields above before submitting.
        </div>
      )}

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
