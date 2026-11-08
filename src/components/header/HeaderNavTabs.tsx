"use client";

import React from "react";
import { FileText, Kanban, Target } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { WorkspaceTab } from "@/types/outterring";

interface HeaderNavTabsProps {
  currentTab: WorkspaceTab;
  hasActiveFocus: boolean;
  runwayCount: number;
  docsCount: number;
  onTabChange: (tab: WorkspaceTab) => void;
}

export function HeaderNavTabs({
  currentTab,
  hasActiveFocus,
  runwayCount,
  docsCount,
  onTabChange,
}: HeaderNavTabsProps) {
  const tabs: Array<{
    id: WorkspaceTab;
    label: string;
    keyHint: string;
    countLabel?: string;
    Icon: typeof Target;
  }> = [
    {
      id: "focus",
      label: "Focus",
      keyHint: "1",
      countLabel: hasActiveFocus ? "1" : undefined,
      Icon: Target,
    },
    {
      id: "board",
      label: "Board",
      keyHint: "2",
      countLabel: runwayCount > 0 ? String(runwayCount) : undefined,
      Icon: Kanban,
    },
    {
      id: "docs",
      label: "Docs",
      keyHint: "3",
      countLabel: docsCount > 0 ? String(docsCount) : undefined,
      Icon: FileText,
    },
  ];

  return (
    <nav
      aria-label="Workspace views"
      className="miro-island pointer-events-auto isolate order-3 flex w-full items-center justify-between gap-1 rounded-full p-1 sm:order-none sm:w-auto sm:justify-center"
    >
      {tabs.map(({ id, label, keyHint, countLabel, Icon }) => {
        const active = currentTab === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (currentTab === id) return;
              sounds.playPop();
              onTabChange(id);
            }}
            className={`miro-tactile relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium sm:flex-initial ${
              active
                ? "text-ink-primary"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {active && (
              <span
                aria-hidden="true"
                className="active-nav-pill liquid-nav-bubble absolute inset-0 -z-10 rounded-full"
              />
            )}
            <Icon
              className={`h-3.5 w-3.5 shrink-0 ${
                active ? "text-accent" : "text-ink-muted"
              }`}
              aria-hidden="true"
            />
            <span>{label}</span>
            {countLabel && (
              <span className="hidden md:inline-block font-mono text-[11px] text-ink-muted">
                {countLabel}
              </span>
            )}
            <kbd className="hidden sm:inline-block rounded-full bg-well/80 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
              {keyHint}
            </kbd>
          </button>
        );
      })}
    </nav>
  );
}
