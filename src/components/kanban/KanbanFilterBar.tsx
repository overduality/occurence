"use client";

import React from "react";
import { Search } from "lucide-react";
import type { TaskPriority } from "@/types/outterring";

interface KanbanFilterBarProps {
  boardSearch: string;
  priorityFilter: "all" | TaskPriority;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: "all" | TaskPriority) => void;
}

export function KanbanFilterBar({
  boardSearch,
  priorityFilter,
  onSearchChange,
  onPriorityChange,
}: KanbanFilterBarProps) {
  const priorities: Array<"all" | TaskPriority> = ["all", "urgent", "high", "medium", "low"];

  return (
    <search
      aria-label="Filter board issues"
      className="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-line-subtle pt-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={boardSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter..."
            aria-label="Filter board issues"
            className="w-48 rounded-full border border-line-subtle bg-well/65 py-1.5 pl-8 pr-3 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
          />
        </div>

        <div
          role="group"
          aria-label="Filter by priority"
          className="flex items-center gap-0.5 rounded-full bg-well p-0.5 text-[11px]"
        >
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPriorityChange(p)}
              className={`rounded-full px-2.5 py-1 font-medium capitalize transition-colors ${
                priorityFilter === p
                  ? "liquid-nav-bubble text-ink-primary"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </search>
  );
}
