"use client";

import React, { useState } from "react";
import { Check, Compass, Loader2, Scissors } from "lucide-react";
import { sounds } from "@/lib/sound";

interface FocusCardActionsProps {
  taskId: string;
  hasTodoTasks: boolean;
  onCompleteTask: (taskId: string) => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onTriggerGrounding: () => void;
  onParkActiveTask: (taskId: string) => void;
}

export function FocusCardActions({
  taskId,
  hasTodoTasks,
  onCompleteTask,
  onSliceTask,
  onTriggerGrounding,
  onParkActiveTask,
}: FocusCardActionsProps) {
  const [isSlicing, setIsSlicing] = useState(false);

  const handleSliceClick = async () => {
    if (isSlicing) return;
    setIsSlicing(true);
    sounds.playPop();
    try {
      await onSliceTask(taskId);
    } finally {
      setIsSlicing(false);
    }
  };

  return (
    <div className="focus-card-actions mt-6 border-t border-line-subtle pt-4">
      <button
        type="button"
        onClick={() => onCompleteTask(taskId)}
        className="miro-tactile apple-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
      >
        <Check className="h-4 w-4 stroke-[2.25]" aria-hidden="true" />
        <span>Done</span>
        <kbd className="ml-1 rounded-full bg-white/20 px-2 py-0.5 font-mono text-[10px] text-accent-fg">
          Space
        </kbd>
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isSlicing}
          onClick={handleSliceClick}
          className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-hover disabled:opacity-50"
        >
          {isSlicing ? (
            <Loader2 className="spinner-smooth h-3.5 w-3.5 text-accent" aria-hidden="true" />
          ) : (
            <Scissors className="h-3.5 w-3.5 text-ink-secondary" aria-hidden="true" />
          )}
          <span>Slice</span>
        </button>

        <button
          type="button"
          onClick={onTriggerGrounding}
          className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-hover"
        >
          <Compass className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>Ground</span>
        </button>

        {hasTodoTasks && (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onParkActiveTask(taskId);
            }}
            className="miro-tactile liquid-nav-bubble rounded-full px-3.5 py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            Swap
          </button>
        )}
      </div>
    </div>
  );
}
