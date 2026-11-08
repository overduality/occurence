"use client";

import React from "react";
import { Layers, Plus } from "lucide-react";

export function GuideSectionSprints() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-line-subtle bg-well/60 p-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-status-warn-ink" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-primary">
            How Sprints Work in Occuring
          </h3>
        </div>
        <p className="prose-pretty mt-1.5 text-xs leading-relaxed text-ink-secondary">
          A Sprint is an active, bounded cycle of work (usually 3–5 micro-steps) centered around a clear goal. Unlike giant backlogs, sprints keep your attention locked onto what matters this week or day.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            1. Creating a Sprint (&ldquo;Why was my new sprint empty?&rdquo;)
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            When you click <strong>+ New Sprint</strong>, Occuring creates the new sprint container and sets it as the <strong>Active Sprint</strong>. Since it&apos;s brand new, it starts with 0 tasks until you assign them!
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-1 text-[11px] text-ink-primary font-medium">
              <Plus className="h-3 w-3 text-accent" />
              <span>Click &ldquo;+ Add Step&rdquo; on the board</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-1 text-[11px] text-ink-primary font-medium">
              <Layers className="h-3 w-3 text-status-warn-ink" />
              <span>Click &ldquo;Move Unfinished Tasks&rdquo; to pull To Do steps</span>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            2. Switching Views via the Sprint Ribbon
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            At the top of the Board, use the <strong>Sprint Ribbon</strong> to switch between viewing your <strong>Active Sprint</strong>, <strong>All Tasks</strong>, or <strong>Archive / Completed Sprints</strong>.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            3. Assigning Any Task to a Sprint
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Click any task title or press <kbd className="rounded bg-well px-1 text-[10px]">E</kbd> to open the <strong>Issue Inspector</strong>. Under the <strong>Sprint</strong> dropdown, you can assign or move that task to any sprint instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
