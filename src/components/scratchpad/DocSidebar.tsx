"use client";

import React from "react";
import { FileText, Pin, Plus, Search } from "lucide-react";
import { sounds } from "@/lib/sound";
import { runViewTransition } from "@/lib/web-platform";
import type { Doc, DocCategory } from "@/types/outterring";
import { CATEGORIES, DOC_TEMPLATES } from "./constants";

interface DocSidebarProps {
  filteredDocs: Doc[];
  activeDocId?: string;
  searchQuery: string;
  categoryFilter: "all" | DocCategory;
  onSearchChange: (q: string) => void;
  onCategoryFilterChange: (cat: "all" | DocCategory) => void;
  onSelectDoc: (id: string) => void;
  onCreateDoc: (template?: {
    title: string;
    content: string;
    category: DocCategory;
    tags: string[];
  }) => void;
}

export function DocSidebar({
  filteredDocs,
  activeDocId,
  searchQuery,
  categoryFilter,
  onSearchChange,
  onCategoryFilterChange,
  onSelectDoc,
  onCreateDoc,
}: DocSidebarProps) {
  return (
    <aside
      aria-label="Pages directory"
      className="miro-frame-zone flex flex-col rounded-3xl p-4 lg:col-span-3 lg:sticky lg:top-20 lg:self-start"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-ink-secondary">
          Pages ({filteredDocs.length})
        </h2>

        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onCreateDoc();
          }}
          className="miro-tactile apple-btn-primary inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>New</span>
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1 border-b border-line-subtle pb-2.5">
        {DOC_TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => {
              sounds.playPop();
              onCreateDoc({
                title: tpl.title,
                content: tpl.content,
                category: tpl.category,
                tags: tpl.tags,
              });
            }}
            className="miro-tactile liquid-nav-bubble rounded-full px-2 py-0.5 text-[11px] font-medium text-ink-secondary hover:text-ink-primary"
          >
            +{tpl.label}
          </button>
        ))}
      </div>

      <search aria-label="Filter pages" className="mt-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
          <label htmlFor="scratchpad-search" className="sr-only">Search pages</label>
          <input
            id="scratchpad-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pages..."
            className="w-full rounded-full border border-line-subtle bg-well/65 py-1.5 pl-8 pr-3 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sounds.playPop();
                onCategoryFilterChange(cat.id);
              }}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                categoryFilter === cat.id
                  ? "bg-accent-soft text-accent"
                  : "text-ink-secondary hover:bg-hover hover:text-ink-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </search>

      <div className="mt-3 max-h-[500px] flex-1 space-y-1 overflow-y-auto pr-0.5">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isSelected = activeDocId === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  if (isSelected) return;
                  sounds.playPop();
                  runViewTransition(() => {
                    onSelectDoc(doc.id);
                  });
                }}
                className={`miro-tactile flex w-full flex-col rounded-2xl px-3 py-2 text-left ${
                  isSelected
                    ? "liquid-nav-bubble text-ink-primary"
                    : "text-ink-secondary hover:bg-hover/70 hover:text-ink-primary"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <FileText
                      className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-accent" : "text-ink-muted"}`}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[13px] font-medium">{doc.title}</span>
                  </span>
                  {Boolean(doc.is_pinned) && (
                    <Pin className="h-3 w-3 shrink-0 text-status-warn-ink" aria-label="Pinned" />
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between pl-5 text-[11px] text-ink-muted">
                  <span className="capitalize">{doc.category}</span>
                  <span>
                    {new Date(doc.updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-line-subtle p-4 text-center">
            <p className="text-xs text-ink-muted">No pages</p>
          </div>
        )}
      </div>
    </aside>
  );
}
