"use client";

import React from "react";
import { sounds } from "@/lib/sound";

interface OmniBarExamplesProps {
  onSelectExample: (text: string) => void;
}

const QUICK_EXAMPLES = [
  "Add refresh token guard",
  "Sprint: Webhook queue, tests, docker",
  "Note: Architecture decisions",
];

export function OmniBarExamples({ onSelectExample }: OmniBarExamplesProps) {
  return (
    <div className="mt-3.5 border-t border-line-subtle pt-3">
      <p className="mb-2 text-[11px] font-medium text-ink-muted">
        Examples:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_EXAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              sounds.playPop();
              onSelectExample(sample);
            }}
            className="miro-tactile liquid-nav-bubble rounded-full px-3 py-1 text-left text-[11px] text-ink-secondary hover:text-ink-primary"
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
