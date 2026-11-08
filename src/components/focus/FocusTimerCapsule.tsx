"use client";

import React from "react";
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from "lucide-react";
import { sounds } from "@/lib/sound";
import { runViewTransition } from "@/lib/web-platform";
import type { Sprint, Task } from "@/types/outterring";
import { TIMER_PRESETS } from "./constants";

interface FocusTimerCapsuleProps {
  activeSprint: Sprint | null;
  todoTasks: Task[];
  presetMinutes: number;
  secondsLeft: number;
  timerRunning: boolean;
  isMiniWidget: boolean;
  formattedTimer: string;
  onSelectPreset: (mins: number, secs: number) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onToggleMiniWidget: () => void;
}

export function FocusTimerCapsule({
  activeSprint,
  todoTasks,
  presetMinutes,
  secondsLeft,
  timerRunning,
  isMiniWidget,
  formattedTimer,
  onSelectPreset,
  onToggleTimer,
  onResetTimer,
  onToggleMiniWidget,
}: FocusTimerCapsuleProps) {
  return (
    <div className="miro-island mb-6 flex flex-wrap items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-xs">
      <div className="flex items-center gap-2 px-1">
        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        <span className="font-medium text-ink-primary">
          {activeSprint ? activeSprint.title : "Focus"}
        </span>
        <span className="rounded-full bg-well px-2 py-0.5 font-mono text-[11px] text-ink-secondary">
          1 / {1 + todoTasks.length}
        </span>
      </div>

      <span className="h-3.5 w-px bg-line-subtle" aria-hidden="true" />

      <div className="flex items-center gap-1">
        <div
          role="group"
          aria-label="Timer duration presets"
          className="flex items-center rounded-full bg-well p-0.5 font-mono text-[11px]"
        >
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.minutes}
              type="button"
              onClick={() => onSelectPreset(p.minutes, p.seconds)}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                presetMinutes === p.minutes
                  ? "liquid-nav-bubble font-medium text-ink-primary"
                  : "text-ink-muted hover:text-ink-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleTimer}
          aria-label={timerRunning ? "Pause" : "Start"}
          className={`miro-tactile inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium ${
            timerRunning
              ? "bg-accent-soft text-accent"
              : "text-ink-secondary hover:bg-hover hover:text-ink-primary"
          }`}
        >
          {timerRunning ? (
            <Pause className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Play className="h-3 w-3" aria-hidden="true" />
          )}
          <span>{formattedTimer}</span>
        </button>

        {secondsLeft !== presetMinutes * 60 && (
          <button
            type="button"
            aria-label="Reset timer"
            onClick={onResetTimer}
            className="miro-tactile rounded-full p-1 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </button>
        )}
      </div>

      <span className="h-3.5 w-px bg-line-subtle" aria-hidden="true" />

      <button
        type="button"
        onClick={() => {
          sounds.playPop();
          runViewTransition(() => {
            onToggleMiniWidget();
          });
        }}
        aria-label={isMiniWidget ? "Expand" : "Collapse"}
        className="miro-tactile inline-flex items-center gap-1 rounded-full p-1 text-ink-secondary hover:bg-hover hover:text-ink-primary"
      >
        {isMiniWidget ? (
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
