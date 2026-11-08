"use client";

import React from "react";
import { sounds } from "@/lib/sound";
import type { TriageMode } from "@/types/outterring";

interface OmniBarModeSelectorProps {
  mode: TriageMode;
  onSelectMode: (mode: TriageMode) => void;
}

const MODES: Array<{ id: TriageMode; label: string }> = [
  { id: "auto", label: "Auto" },
  { id: "task", label: "Task" },
  { id: "sprint", label: "Sprint" },
  { id: "doc", label: "Doc" },
];

export function OmniBarModeSelector({ mode, onSelectMode }: OmniBarModeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Capture target mode"
      className="flex items-center gap-0.5 rounded-full bg-well p-0.5 text-[11px]"
    >
      {MODES.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => {
            sounds.playPop();
            onSelectMode(opt.id);
          }}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            mode === opt.id
              ? "liquid-nav-bubble text-ink-primary"
              : "text-ink-secondary hover:text-ink-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
