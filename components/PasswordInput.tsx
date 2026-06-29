"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  id?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  className?: string;
};

export default function PasswordInput({
  id,
  name,
  placeholder,
  required,
  autoComplete = "current-password",
  minLength,
  maxLength,
  className = "",
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-200 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
