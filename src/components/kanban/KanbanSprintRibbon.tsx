"use client";

import React from "react";
import { sounds } from "@/lib/sound";
import type { Sprint } from "@/types/outterring";

interface KanbanSprintRibbonProps {
  sprints: Sprint[];
  activeSprint: Sprint | null;
  sprintFilter: string;
  totalTaskCount: number;
  onSelectSprintFilter: (filter: string) => void;
}

export function KanbanSprintRibbon({
  sprints,
  activeSprint,
  sprintFilter,
  totalTaskCount,
  onSelectSprintFilter,
}: KanbanSprintRibbonProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-subtle pt-3 text-xs">
      {activeSprint && (
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onSelectSprintFilter("active");
          }}
          className={`miro-tactile inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
            sprintFilter === "active" || sprintFilter === activeSprint.id
              ? "border border-accent bg-accent-soft text-accent shadow-sm"
              : "liquid-nav-bubble text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span>{activeSprint.title}</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          sounds.playPop();
          onSelectSprintFilter("all");
        }}
        className={`miro-tactile inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
          sprintFilter === "all"
            ? "border border-line-strong bg-card text-ink-primary shadow-sm"
            : "liquid-nav-bubble text-ink-secondary hover:text-ink-primary"
        }`}
      >
        <span>All ({totalTaskCount})</span>
      </button>

      {sprints.length > 0 && (
        <select
          id="board-sprint-ribbon-select"
          value={sprintFilter}
          onChange={(e) => {
            sounds.playPop();
            onSelectSprintFilter(e.target.value);
          }}
          aria-label="Filter board issues by specific sprint"
          className="auto-fit-select rounded-full border border-line-subtle bg-well/75 px-3 py-1 text-xs text-ink-secondary hover:text-ink-primary outline-none focus:border-accent"
        >
          <option value="active">Active ({activeSprint?.title ?? "None"})</option>
          <option value="all">All ({totalTaskCount})</option>
          <optgroup label="Sprints">
            {sprints.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.title} {sp.status === "active" ? "● Active" : "✓"}
              </option>
            ))}
          </optgroup>
          <option value="unassigned">Unassigned</option>
        </select>
      )}
    </div>
  );
}
