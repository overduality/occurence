"use client";

import React, { useRef } from "react";
import {
  Search,
  Compass,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import { handleDeclarativePopoverClick } from "@/lib/web-platform";
import type { WorkspaceTab } from "@/types/outterring";
import { ControlCenterPopover } from "./header/ControlCenterPopover";
import { HeaderNavTabs } from "./header/HeaderNavTabs";
import { PREFS_POPOVER_ID } from "./header/types";
import { useThemePreferences } from "./header/useThemePreferences";

interface HeaderProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onOpenOmniBar: () => void;
  onTriggerGrounding: () => void;
  onOpenGuide?: () => void;
  onExportWorkspace: () => void;
  tasksCompletedCount: number;
  focusMinutesCount: number;
  activeSprintTitle?: string | null;
  hasActiveFocus?: boolean;
  runwayCount?: number;
  docsCount?: number;
}

export function Header({
  currentTab,
  onTabChange,
  onOpenOmniBar,
  onTriggerGrounding,
  onOpenGuide,
  onExportWorkspace,
  tasksCompletedCount,
  focusMinutesCount,
  activeSprintTitle,
  hasActiveFocus = false,
  runwayCount = 0,
  docsCount = 0,
}: HeaderProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverBtnRef = useRef<HTMLButtonElement>(null);

  const {
    themeSetting,
    systemPrefersDark,
    soundMuted,
    reduceTransparency,
    handleSelectTheme,
    handleToggleTransparency,
    handleToggleSound,
  } = useThemePreferences();

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-30 w-full select-none px-3 pt-3 pb-2 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
          <div className="miro-island pointer-events-auto flex items-center gap-2 rounded-full py-1.5 pr-2 pl-2">
            <div
              className="apple-btn-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-ink-primary">
              Occuring
            </h1>

            {activeSprintTitle && (
              <span className="hidden lg:inline-flex max-w-[190px] truncate rounded-full bg-well px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
                {activeSprintTitle}
              </span>
            )}

            <span className="mx-0.5 h-3.5 w-px bg-line-subtle" aria-hidden="true" />

            <button
              ref={popoverBtnRef}
              type="button"
              title="Control Center & Preferences"
              aria-label="Open Control Center, appearance, material, and keyboard shortcuts"
              onClick={() =>
                handleDeclarativePopoverClick(popoverRef.current, popoverBtnRef.current)
              }
              {...({
                commandfor: PREFS_POPOVER_ID,
                command: "toggle-popover",
                popovertarget: PREFS_POPOVER_ID,
              } as Record<string, string>)}
              className="miro-tactile flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-secondary hover:bg-hover hover:text-ink-primary"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <HeaderNavTabs
            currentTab={currentTab}
            hasActiveFocus={hasActiveFocus}
            runwayCount={runwayCount}
            docsCount={docsCount}
            onTabChange={onTabChange}
          />

          <div className="miro-island pointer-events-auto flex items-center gap-1.5 rounded-full p-1 pl-3">
            <div
              className="hidden sm:flex items-center gap-1.5 pr-1.5 text-xs font-medium text-ink-secondary"
              aria-label={`${tasksCompletedCount} steps completed today, ${focusMinutesCount} focus minutes`}
            >
              <CheckCircle2
                className="h-3.5 w-3.5 text-status-success-ink"
                aria-hidden="true"
              />
              <span>{tasksCompletedCount} done</span>
              {focusMinutesCount > 0 && (
                <span className="font-mono text-[11px] text-ink-muted">
                  · {focusMinutesCount}m
                </span>
              )}
            </div>

            {onOpenGuide && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onOpenGuide();
                }}
                className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
                title="Guide"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={onTriggerGrounding}
              className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
              title="Ground (G)"
            >
              <Compass
                className="h-3.5 w-3.5 text-accent"
                aria-hidden="true"
              />
              <kbd className="font-mono text-[10px] text-ink-muted">G</kbd>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onOpenOmniBar();
              }}
              className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              title="Capture (⌘K)"
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              <kbd className="rounded-full bg-white/20 px-1.5 py-0.5 font-mono text-[10px] text-accent-fg">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <ControlCenterPopover
        popoverRef={popoverRef}
        themeSetting={themeSetting}
        systemPrefersDark={systemPrefersDark}
        soundMuted={soundMuted}
        reduceTransparency={reduceTransparency}
        onSelectTheme={handleSelectTheme}
        onToggleTransparency={handleToggleTransparency}
        onToggleSound={handleToggleSound}
        onExportWorkspace={onExportWorkspace}
      />
    </>
  );
}
