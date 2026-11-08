"use client";

import React from "react";
import { ArchiveRestore, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Task } from "@/types/outterring";

interface FocusHUDEmptyStateProps {
  todoTasks: Task[];
  backlogCount: number;
  onOpenOmniBar: () => void;
  onPromoteTask: (taskId: string) => void;
  onPullFromBacklog: () => void;
}

export function FocusHUDEmptyState({
  todoTasks,
  backlogCount,
  onOpenOmniBar,
  onPromoteTask,
  onPullFromBacklog,
}: FocusHUDEmptyStateProps) {
  return (
    <section
      aria-label="Focus Canvas empty state"
      className="flex min-h-[calc(100vh-5.5rem)] flex-col items-center justify-center px-4 py-12"
    >
      <div className="card-elevated w-full max-w-sm rounded-3xl p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-status-success-soft text-status-success-ink">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="heading-balance mt-3 text-base font-semibold tracking-tight text-ink-primary">
          All clear
        </h2>
        <p className="prose-pretty mx-auto mt-1 text-xs text-ink-muted">
          Select a task or capture a new step.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onOpenOmniBar();
            }}
            className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Step (⌘K)</span>
          </button>

          {todoTasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onPromoteTask(todoTasks[0].id);
              }}
              className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
            >
              <ArrowRight className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>Start Next</span>
            </button>
          )}

          {todoTasks.length === 0 && backlogCount > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onPullFromBacklog();
              }}
              className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
            >
              <ArchiveRestore
                className="h-3.5 w-3.5 text-ink-secondary"
                aria-hidden="true"
              />
              <span>Backlog ({backlogCount})</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
