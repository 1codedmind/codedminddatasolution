"use client";

import { useResumeStore } from "@/store/resumeStore";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CustomSectionEditor() {
  const {
    data, activeSection,
    renameCustomSection,
    addCustomSectionItem, updateCustomSectionItem, removeCustomSectionItem,
    addCustomSectionItemBullet, updateCustomSectionItemBullet, removeCustomSectionItemBullet,
  } = useResumeStore();

  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const cs = (data.customSections ?? []).find((s) => s.id === activeSection);
  if (!cs) return null;

  function toggleItem(id: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Section title */}
      <div>
        <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1">Section Title</label>
        <input
          className="w-full text-[13px] border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent bg-white"
          value={cs.title}
          onChange={(e) => renameCustomSection(cs.id, e.target.value)}
          placeholder="e.g. Awards, Publications, Volunteering…"
        />
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Entries</p>
          <button
            onClick={() => {
              addCustomSectionItem(cs.id);
              // auto-open new item
              setTimeout(() => {
                const newItem = useResumeStore.getState().data.customSections?.find(s => s.id === cs.id)?.items.at(-1);
                if (newItem) setOpenItems(prev => new Set([...prev, newItem.id]));
              }, 0);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg px-2.5 py-1 transition-colors"
          >
            <Plus size={12} strokeWidth={2.5} /> Add Entry
          </button>
        </div>

        {cs.items.length === 0 && (
          <p className="text-[12px] text-stone-400 py-3 text-center">No entries yet. Click "Add Entry" to start.</p>
        )}

        <div className="space-y-2">
          {cs.items.map((item, idx) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id} className="border border-stone-200 rounded-lg overflow-hidden bg-white">
                {/* Item header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-stone-50">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0"
                  >
                    {isOpen ? <ChevronDown size={13} className="text-stone-400 shrink-0" /> : <ChevronRight size={13} className="text-stone-400 shrink-0" />}
                    <span className="text-[12px] font-medium text-stone-700 truncate">
                      {item.heading || `Entry ${idx + 1}`}
                    </span>
                  </button>
                  <button
                    onClick={() => removeCustomSectionItem(cs.id, item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {isOpen && (
                  <div className="px-3 py-3 space-y-2.5 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">Title / Heading</label>
                        <input
                          className="w-full text-[12px] border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                          value={item.heading}
                          onChange={(e) => updateCustomSectionItem(cs.id, item.id, { heading: e.target.value })}
                          placeholder="e.g. Best Paper Award"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">Subtitle / Organization</label>
                        <input
                          className="w-full text-[12px] border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                          value={item.subtitle}
                          onChange={(e) => updateCustomSectionItem(cs.id, item.id, { subtitle: e.target.value })}
                          placeholder="e.g. IEEE Conference"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">Date</label>
                      <input
                        type="month"
                        className="w-full text-[12px] border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                        value={item.date}
                        onChange={(e) => updateCustomSectionItem(cs.id, item.id, { date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide block mb-1">Description</label>
                      <textarea
                        className="w-full text-[12px] border border-stone-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent resize-none"
                        rows={2}
                        value={item.description}
                        onChange={(e) => updateCustomSectionItem(cs.id, item.id, { description: e.target.value })}
                        placeholder="Optional short description…"
                      />
                    </div>

                    {/* Bullets */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Bullet Points</label>
                        <button
                          onClick={() => addCustomSectionItemBullet(cs.id, item.id)}
                          className="text-[10px] text-stone-500 hover:text-stone-900 font-medium flex items-center gap-0.5 transition-colors"
                        >
                          <Plus size={10} /> Add
                        </button>
                      </div>
                      {item.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1.5">
                          <span className="text-stone-300 mt-2 text-xs leading-none shrink-0">•</span>
                          <input
                            className="flex-1 text-[12px] border border-stone-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                            value={b}
                            onChange={(e) => updateCustomSectionItemBullet(cs.id, item.id, i, e.target.value)}
                            placeholder={`Bullet point ${i + 1}`}
                          />
                          <button
                            onClick={() => removeCustomSectionItemBullet(cs.id, item.id, i)}
                            className="mt-1.5 w-5 h-5 flex items-center justify-center rounded text-stone-300 hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
