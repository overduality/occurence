"use client";

import React from "react";
import { Plus, RotateCcw, Target } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Sprint } from "@/types/outterring";

interface KanbanEmptySprintBannerProps {
  currentViewedSprint: Sprint;
  hasOtherUnfinishedTasks: boolean;
  onRollOverUnfinished: (sprintId: string) => Promise<void>;
  onOpenStepComposer: () => void;
}

export function KanbanEmptySprintBanner({
  currentViewedSprint,
  hasOtherUnfinishedTasks,
  onRollOverUnfinished,
  onOpenStepComposer,
}: KanbanEmptySprintBannerProps) {
  return (
    <div className="card-elevated mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs animate-fade-in">
      <div className="flex items-center gap-2">
        <Target className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        <span className="font-medium text-ink-primary">Sprint is empty</span>
        {currentViewedSprint.goal && (
          <span className="hidden text-ink-muted sm:inline">· {currentViewedSprint.goal}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasOtherUnfinishedTasks && (
          <button
            type="button"
            onClick={async () => {
              sounds.playComplete();
              await onRollOverUnfinished(currentViewedSprint.id);
            }}
            className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-ink-primary hover:bg-hover"
          >
            <RotateCcw className="h-3 w-3 text-accent" aria-hidden="true" />
            <span>Roll Over</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onOpenStepComposer();
          }}
          className="miro-tactile apple-btn-primary inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          <span>Step</span>
        </button>
      </div>
    </div>
  );
}
