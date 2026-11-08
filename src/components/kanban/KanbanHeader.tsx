"use client";

import React from "react";
import { Archive, Flag, Pencil, Plus } from "lucide-react";
import { sounds } from "@/lib/sound";
import { runViewTransition } from "@/lib/web-platform";
import type { Sprint, TaskPriority } from "@/types/outterring";
import { KanbanFilterBar } from "./KanbanFilterBar";
import { KanbanSprintRibbon } from "./KanbanSprintRibbon";

interface KanbanHeaderProps {
  currentViewedSprint: Sprint | null;
  activeSprint: Sprint | null;
  sprints: Sprint[];
  sprintFilter: string;
  totalTasks: number;
  backlogCount: number;
  activeRunwayLoad: number;
  showBacklogVault: boolean;
  boardSearch: string;
  priorityFilter: "all" | TaskPriority;
  onToggleBacklogVault: () => void;
  onOpenSprintEditor: (mode: "create" | "edit") => void;
  onCompleteSprint: (sprintId: string) => void;
  onOpenAddColumn: () => void;
  onOpenStepComposer: () => void;
  onSelectSprintFilter: (filter: string) => void;
  onSearchChange: (query: string) => void;
  onPriorityChange: (priority: "all" | TaskPriority) => void;
}

export function KanbanHeader({
  currentViewedSprint,
  activeSprint,
  sprints,
  sprintFilter,
  totalTasks,
  backlogCount,
  activeRunwayLoad,
  showBacklogVault,
  boardSearch,
  priorityFilter,
  onToggleBacklogVault,
  onOpenSprintEditor,
  onCompleteSprint,
  onOpenAddColumn,
  onOpenStepComposer,
  onSelectSprintFilter,
  onSearchChange,
  onPriorityChange,
}: KanbanHeaderProps) {
  const headerTitle = currentViewedSprint
    ? currentViewedSprint.title
    : sprintFilter === "all"
      ? "All Tasks"
      : activeSprint
        ? activeSprint.title
        : "Sprint Board";

  return (
    <div className="card-elevated mb-4 rounded-3xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-ink-primary sm:text-lg">
              {headerTitle}
            </h2>

            {currentViewedSprint && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  currentViewedSprint.status === "active"
                    ? "bg-accent-soft text-accent"
                    : "bg-well text-ink-muted"
                }`}
              >
                {currentViewedSprint.status === "active" ? "Active" : "Done"}
              </span>
            )}

            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                activeRunwayLoad <= 5
                  ? "bg-status-success-soft text-status-success-ink"
                  : "bg-status-warn-soft text-status-warn-ink"
              }`}
            >
              {activeRunwayLoad}/5
            </span>

            {currentViewedSprint && (
              <button
                type="button"
                onClick={() => onOpenSprintEditor("edit")}
                className="miro-tactile inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-ink-muted hover:bg-hover hover:text-ink-primary"
              >
                <Pencil className="h-3 w-3" aria-hidden="true" />
                <span>Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenSprintEditor("create")}
              className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
            >
              <Flag className="h-3 w-3" aria-hidden="true" />
              <span>+ Sprint</span>
            </button>
          </div>
          {currentViewedSprint?.goal && (
            <p className="mt-1 text-xs text-ink-secondary line-clamp-1">{currentViewedSprint.goal}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentViewedSprint && currentViewedSprint.status === "active" && (
            <button
              type="button"
              onClick={() => onCompleteSprint(currentViewedSprint.id)}
              className="miro-tactile liquid-nav-bubble rounded-full px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
            >
              Complete
            </button>
          )}

          <button
            type="button"
            aria-pressed={showBacklogVault}
            onClick={() => {
              sounds.playPop();
              runViewTransition(onToggleBacklogVault);
            }}
            className={`miro-tactile inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ${
              showBacklogVault
                ? "border border-accent bg-accent-soft text-accent"
                : "liquid-nav-bubble text-ink-primary hover:bg-hover"
            }`}
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Backlog ({backlogCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddColumn}
            className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover"
          >
            <Plus className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Column</span>
          </button>

          <button
            type="button"
            onClick={onOpenStepComposer}
            className="miro-tactile apple-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Step</span>
          </button>
        </div>
      </div>

      <KanbanSprintRibbon
        sprints={sprints}
        activeSprint={activeSprint}
        sprintFilter={sprintFilter}
        totalTaskCount={totalTasks}
        onSelectSprintFilter={onSelectSprintFilter}
      />

      <KanbanFilterBar
        boardSearch={boardSearch}
        priorityFilter={priorityFilter}
        onSearchChange={onSearchChange}
        onPriorityChange={onPriorityChange}
      />
    </div>
  );
}
