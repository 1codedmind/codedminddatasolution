"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackContactSubmitted } from "@/lib/analytics";

type FormState = "idle" | "loading" | "success" | "error";

type Fields = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", company: "", phone: "", message: "" };

function FieldError({ field, message }: { field: keyof Fields; message?: string }) {
  if (!message) return null;
  return (
    <p id={`contact-${field}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
      {message}
    </p>
  );
}

// Mirrors the server-side checks in app/api/leads/route.ts so the user sees the
// problem before a round-trip. The server remains the source of truth.
function validate(form: Fields): FieldErrors {
  const errors: FieldErrors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  const email = form.email.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Enter a valid email address, e.g. alex@company.com.";
  } else if (email.length > 254) {
    errors.email = "Email address is too long.";
  }

  const phone = form.phone.trim();
  // Optional, but if given it must look like a phone number.
  if (phone && !/^\+?[\d\s()-]{7,20}$/.test(phone)) {
    errors.phone = "Enter a valid phone number, e.g. +91 98765 43210.";
  }

  if (form.company.trim().length > 100) {
    errors.company = "Company name must be 100 characters or fewer.";
  }

  const message = form.message.trim();
  if (!message) {
    errors.message = "Please tell us what you're working on.";
  } else if (message.length < 10) {
    errors.message = "Please add a little more detail (10 characters minimum).";
  } else if (message.length > 5000) {
    errors.message = "Message must be 5000 characters or fewer.";
  }

  return errors;
}

export default function ContactForm({ source = "cta_form" }: { source?: string }) {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof Fields) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setState("idle");
      setErrorMsg("");
      return;
    }

    setErrors({});
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong");
      }
      setState("success");
      trackContactSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] focus:ring-1 focus:ring-[#C87660] transition-colors";
  const invalidClass = "border-red-500/70 focus:border-red-500 focus:ring-red-500";

  const fieldClass = (field: keyof Fields) =>
    `${inputClass} ${errors[field] ? invalidClass : ""}`;

  const a11y = (field: keyof Fields) => ({
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <AnimatePresence mode="wait">
      {state === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center bg-stone-900 border border-stone-800 rounded-2xl p-12 min-h-[320px]"
        >
          <CheckCircle2 size={40} className="text-[#C87660] mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Message received</p>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            We&apos;ll review your message and get back to you within 1–2 business days.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          noValidate
          className="bg-stone-900 border border-stone-800 rounded-2xl p-8 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-medium text-stone-400 mb-1.5">
                Name <span className="text-[#C87660]">*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                placeholder="Alex Johnson"
                value={form.name}
                onChange={(e) => set("name")(e.target.value)}
                className={fieldClass("name")}
                {...a11y("name")}
              />
              <FieldError field="name" message={errors.name} />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium text-stone-400 mb-1.5">
                Work email <span className="text-[#C87660]">*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="alex@company.com"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                className={fieldClass("email")}
                {...a11y("email")}
              />
              <FieldError field="email" message={errors.email} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-company" className="block text-xs font-medium text-stone-400 mb-1.5">
                Company
              </label>
              <input
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={100}
                placeholder="Acme Corp (optional)"
                value={form.company}
                onChange={(e) => set("company")(e.target.value)}
                className={fieldClass("company")}
                {...a11y("company")}
              />
              <FieldError field="company" message={errors.company} />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-medium text-stone-400 mb-1.5">
                Phone
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={20}
                placeholder="+91 98765 43210 (optional)"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                className={fieldClass("phone")}
                {...a11y("phone")}
              />
              <FieldError field="phone" message={errors.phone} />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-xs font-medium text-stone-400 mb-1.5">
              What are you building? <span className="text-[#C87660]">*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              maxLength={5000}
              placeholder="Tell us about your data challenge — pipelines, dashboards, automation..."
              value={form.message}
              onChange={(e) => set("message")(e.target.value)}
              className={`${fieldClass("message")} resize-none`}
              {...a11y("message")}
            />
            <FieldError field="message" message={errors.message} />
          </div>

          {state === "error" && (
            <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {errorMsg}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={state === "loading"}
            whileHover={{ scale: state === "loading" ? 1 : 1.01 }}
            whileTap={{ scale: state === "loading" ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-xl bg-[#C87660] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#b5664f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state === "loading" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Sending…
              </>
            ) : (
              "Send message"
            )}
          </motion.button>

          <p className="text-xs text-stone-600 text-center">
            Or email us at{" "}
            <a
              href="mailto:hr@codedmind.co.in"
              className="text-stone-400 hover:text-stone-300 underline underline-offset-2 transition-colors"
            >
              hr@codedmind.co.in
            </a>
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
