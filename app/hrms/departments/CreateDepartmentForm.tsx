"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDepartmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/hrms/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create department");
        return;
      }
      setName("");
      setDescription("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {error && (
        <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          Department name <span className="text-red-400">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Engineering"
          required
          className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
          Description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#C87660] transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="self-start px-5 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating…" : "Create department"}
      </button>
    </form>
  );
}
