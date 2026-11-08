"use client";

import React from "react";
import { Zap } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Task } from "@/types/outterring";

interface FocusKickstartBoxProps {
  activeTask: Task;
  onToggleKickstart: (taskId: string, completed: boolean) => void;
  onStartKickstartTimer: () => void;
}

export function FocusKickstartBox({
  activeTask,
  onToggleKickstart,
  onStartKickstartTimer,
}: FocusKickstartBoxProps) {
  return (
    <div className="focus-kickstart-box mt-5 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <label className="flex flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={Boolean(activeTask.kickstart_completed)}
            onChange={(e) => {
              sounds.playPop();
              onToggleKickstart(activeTask.id, e.target.checked);
            }}
            className="kickstart-check mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border-line-strong"
          />
          <span className="block">
            <span className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
              <Zap className="h-3.5 w-3.5 text-status-warn-ink" aria-hidden="true" />
              <span>Kickstart</span>
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-ink-primary">
              {activeTask.kickstart_action || "First concrete action."}
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={onStartKickstartTimer}
          className="miro-tactile liquid-nav-bubble shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-medium text-ink-primary hover:bg-hover"
        >
          2:00
        </button>
      </div>
    </div>
  );
}
