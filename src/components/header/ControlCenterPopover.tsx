"use client";

import React, { type RefObject } from "react";
import {
  Database,
  Download,
  Layers,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PREFS_POPOVER_ID, type ThemeSetting } from "./types";

interface ControlCenterPopoverProps {
  popoverRef: RefObject<HTMLDivElement>;
  themeSetting: ThemeSetting;
  systemPrefersDark: boolean;
  soundMuted: boolean;
  reduceTransparency: boolean;
  onSelectTheme: (theme: ThemeSetting) => void;
  onToggleTransparency: () => void;
  onToggleSound: () => void;
  onExportWorkspace: () => void;
}

const THEME_OPTIONS: Array<{ id: ThemeSetting; label: string; Icon: typeof Monitor }> = [
  { id: "system", label: "Auto", Icon: Monitor },
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
];

export function ControlCenterPopover({
  popoverRef,
  themeSetting,
  systemPrefersDark,
  soundMuted,
  reduceTransparency,
  onSelectTheme,
  onToggleTransparency,
  onToggleSound,
  onExportWorkspace,
}: ControlCenterPopoverProps) {
  return (
    <div
      ref={popoverRef}
      id={PREFS_POPOVER_ID}
      {...({ popover: "auto" } as Record<string, string>)}
      className="surface-overlay m-0 ml-4 mt-16 w-80 rounded-3xl p-4 text-ink-primary sm:ml-6"
    >
      <div className="flex items-center justify-between border-b border-line-subtle pb-3">
        <span className="text-xs font-semibold tracking-tight text-ink-primary">
          Control Center
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
          <Database className="h-2.5 w-2.5 text-status-success-ink" aria-hidden="true" />
          <span>SQLite WAL</span>
        </span>
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink-secondary">Appearance</span>
          <span className="text-[11px] text-ink-muted">
            {themeSetting === "system"
              ? `Auto (${systemPrefersDark ? "Dark" : "Light"})`
              : themeSetting === "dark"
                ? "Dark"
                : "Light"}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Color theme preference"
          className="mt-1.5 grid grid-cols-3 gap-1 rounded-2xl bg-well p-1 text-xs"
        >
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const selected = themeSetting === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectTheme(id)}
                className={`miro-tactile flex items-center justify-center gap-1.5 rounded-xl py-1.5 font-medium ${
                  selected
                    ? "liquid-nav-bubble text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <button
          type="button"
          aria-pressed={!reduceTransparency}
          onClick={onToggleTransparency}
          className="miro-tactile flex w-full items-center justify-between rounded-2xl border border-line-subtle bg-well/70 px-3 py-2 text-xs font-medium text-ink-primary hover:bg-hover"
        >
          <span className="flex items-center gap-2">
            <Layers
              className={`h-3.5 w-3.5 ${
                reduceTransparency ? "text-ink-muted" : "text-accent"
              }`}
              aria-hidden="true"
            />
            <span>Liquid Glass</span>
          </span>
          <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            {reduceTransparency ? "Off" : "On"}
          </span>
        </button>
      </div>

      <div className="mt-2">
        <button
          type="button"
          aria-pressed={!soundMuted}
          onClick={onToggleSound}
          className="miro-tactile flex w-full items-center justify-between rounded-2xl border border-line-subtle bg-well/70 px-3 py-2 text-xs font-medium text-ink-primary hover:bg-hover"
        >
          <span className="flex items-center gap-2">
            {soundMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            )}
            <span>Sound</span>
          </span>
          <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            {soundMuted ? "Muted" : "On"}
          </span>
        </button>
      </div>

      <div className="mt-3 border-t border-line-subtle pt-3">
        <button
          type="button"
          onClick={onExportWorkspace}
          className="miro-tactile flex w-full items-center justify-between rounded-2xl border border-line-subtle bg-well/70 px-3 py-2 text-xs font-medium text-ink-primary hover:bg-hover"
        >
          <span className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Export Snapshot</span>
          </span>
          <span className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] text-ink-muted">
            JSON
          </span>
        </button>
      </div>
    </div>
  );
}
