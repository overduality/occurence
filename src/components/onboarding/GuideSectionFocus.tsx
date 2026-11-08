"use client";

import React from "react";
import { CheckCircle2, Compass, Play, Target, Zap } from "lucide-react";

export function GuideSectionFocus() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-line-subtle bg-well/60 p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-primary">
            The Rule of ONE &amp; 2-Minute Kickstarts
          </h3>
        </div>
        <p className="prose-pretty mt-1.5 text-xs leading-relaxed text-ink-secondary">
          The hardest part of work is starting. The Focus HUD presents only one physical step and a friction-breaking action to get you moving.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-status-warn-ink" />
            <span className="font-semibold text-xs text-ink-primary">2-Minute Kickstart</span>
          </div>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Every task includes an immediate physical verb (e.g. &ldquo;Open auth.ts line 20&rdquo;). Hit <strong>Start 2:00</strong> to run a frictionless micro-timer.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Play className="h-3.5 w-3.5 text-accent" />
            <span className="font-semibold text-xs text-ink-primary">Multi-Preset Focus Timer</span>
          </div>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Toggle between <strong>2m</strong> (Kickstart), <strong>10m</strong>, and <strong>25m</strong> (Pomodoro). Completed minutes automatically log to your daily focus metrics.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-success-ink" />
            <span className="font-semibold text-xs text-ink-primary">Space to Advance</span>
          </div>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Hit <kbd className="rounded bg-well px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> anytime to complete the current step. The next queued step is promoted automatically.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-accent" />
            <span className="font-semibold text-xs text-ink-primary">I&apos;m Lost (G)</span>
          </div>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Lost focus? Press <kbd className="rounded bg-well px-1 font-mono text-[10px]">G</kbd>. Zero guilt, zero lecturing. It re-anchors you in one calm sentence.
          </p>
        </div>
      </div>
    </div>
  );
}
