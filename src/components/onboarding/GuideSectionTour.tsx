"use client";

import React from "react";
import { Command, FileText, Kanban, Target } from "lucide-react";

export function GuideSectionTour() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-line-subtle bg-well/60 p-4">
        <h3 className="text-base font-semibold text-ink-primary">Why Occuring?</h3>
        <p className="prose-pretty mt-1 text-xs leading-relaxed text-ink-secondary">
          Most project trackers (Jira, Trello, Confluence) are high-friction and show 50+ backlogged tasks simultaneously, triggering executive dysfunction and anxiety. <strong>Occuring</strong> was built from the ground up to give you instant keyboard capture and single-step clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="font-semibold text-xs text-ink-primary">1. Focus HUD</span>
          </div>
          <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
            The <strong>Rule of ONE</strong>. Hides the backlog. Shows only your 1 active task with a 2-minute kickstarter.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Kanban className="h-4 w-4 text-status-warn-ink" aria-hidden="true" />
            <span className="font-semibold text-xs text-ink-primary">2. Sprint Board</span>
          </div>
          <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
            Micro-sprints with a strict <strong>5-item WIP limit</strong>. Safely parks overflow in the Backlog.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-status-success-ink" aria-hidden="true" />
            <span className="font-semibold text-xs text-ink-primary">3. Docs &amp; Notes</span>
          </div>
          <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
            Interactive Markdown notes. Checklists sync live, and 1 click extracts tasks onto the Sprint Board.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-accent-soft/30 p-3.5 text-xs text-ink-primary">
        <Command className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
        <span>
          Press <kbd className="rounded bg-well px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd> anywhere to capture a raw thought, start a sprint, or write a note.
        </span>
      </div>
    </div>
  );
}
