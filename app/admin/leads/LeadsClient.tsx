"use client";

import React, { useState, useMemo } from "react";
import type { Lead } from "@/lib/leads";
import { Download, Search, Users, Calendar, TrendingUp } from "lucide-react";

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#C87660]" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{value}</p>
        <p className="text-xs text-stone-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function LeadsClient({
  leads,
  count,
  thisMonth,
}: {
  leads: Lead[];
  count: number;
  thisMonth: number;
}) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.company ?? "").toLowerCase().includes(q) ||
        (l.message ?? "").toLowerCase().includes(q),
    );
  }, [leads, search]);

  function exportCSV() {
    const headers = ["Name", "Email", "Company", "Message", "Source", "Date"];
    const rows = filtered.map((l) => [
      l.name,
      l.email,
      l.company ?? "",
      l.message ?? "",
      l.source ?? "",
      new Date(l.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Leads</h1>
            <p className="text-stone-500 text-sm mt-0.5">Contact form submissions</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total leads" value={count} icon={Users} />
          <StatCard label="This month" value={thisMonth} icon={TrendingUp} />
          <StatCard label="Showing" value={filtered.length} icon={Calendar} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by name, email, company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] focus:ring-1 focus:ring-[#C87660] transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Company</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Message</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Source</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-stone-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-600 text-sm">
                      {search ? "No results match your search." : "No leads yet."}
                    </td>
                  </tr>
                )}
                {filtered.map((lead) => (
                  <React.Fragment key={lead.id}>
                    <tr
                      onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                      className="border-b border-stone-800/60 hover:bg-stone-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 text-white font-medium whitespace-nowrap">{lead.name}</td>
                      <td className="px-5 py-3.5 text-[#C87660] whitespace-nowrap">
                        <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 whitespace-nowrap">
                        {lead.company ?? <span className="text-stone-700">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 max-w-[240px] truncate">
                        {lead.message ?? <span className="text-stone-700">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[11px] font-medium">
                          {lead.source ?? "direct"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 text-right whitespace-nowrap text-xs">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                    {expanded === lead.id && lead.message && (
                      <tr className="border-b border-stone-800/60 bg-stone-800/20">
                        <td colSpan={6} className="px-5 py-4">
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Full message</p>
                          <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-stone-700 pb-4">
          Showing {filtered.length} of {count} total leads
        </p>
      </div>
    </div>
  );
}
