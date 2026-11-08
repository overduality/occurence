"use client";

import React from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Loader2,
  RotateCcw,
  Scissors,
  Target,
  Trash2,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Task, TaskStatus } from "@/types/outterring";

interface KanbanCardFooterProps {
  task: Task;
  isSlicingThis: boolean;
  onInspectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onSwitchToFocusHUD: () => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
}

export function KanbanCardFooter({
  task,
  isSlicingThis,
  onMoveTask,
  onSwitchToFocusHUD,
  onSliceTask,
  onDeleteTask,
}: KanbanCardFooterProps) {
  const isDone = task.status === "done";
  const isActive = task.status === "in_progress";

  return (
    <div className="kanban-card-footer mt-2.5 border-t border-line-subtle pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {!isActive && !isDone && (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onMoveTask(task.id, "in_progress");
              onSwitchToFocusHUD();
            }}
            className="miro-tactile inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-0.5 text-[11px] font-medium text-ink-primary hover:bg-accent-soft hover:text-accent"
          >
            <Target className="h-3 w-3" aria-hidden="true" />
            <span>Focus</span>
          </button>
        )}

        {!isDone ? (
          <button
            type="button"
            onClick={() => onMoveTask(task.id, "done")}
            className="miro-tactile inline-flex items-center gap-1 rounded-full bg-status-success-soft px-2.5 py-0.5 text-[11px] font-medium text-status-success-ink hover:opacity-85"
          >
            <Check className="h-3 w-3" aria-hidden="true" />
            <span>Done</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onMoveTask(task.id, "todo");
            }}
            className="miro-tactile inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary hover:bg-hover hover:text-ink-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reopen</span>
          </button>
        )}

        {task.status === "backlog" && (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onMoveTask(task.id, "todo");
            }}
            className="miro-tactile inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-0.5 text-[11px] font-medium text-ink-primary hover:bg-hover"
          >
            <ArchiveRestore className="h-3 w-3 text-ink-secondary" aria-hidden="true" />
            <span>To Sprint</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        {!isDone && (
          <button
            type="button"
            title="Slice into smaller steps"
            aria-label="Slice task into smaller micro-actions"
            disabled={isSlicingThis}
            onClick={() => onSliceTask(task.id)}
            className="miro-tactile rounded p-1 text-ink-muted hover:bg-hover hover:text-ink-primary disabled:opacity-50"
          >
            {isSlicingThis ? (
              <Loader2 className="spinner-smooth h-3.5 w-3.5 text-accent" aria-hidden="true" />
            ) : (
              <Scissors className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        )}

        {task.status === "todo" && (
          <button
            type="button"
            title="Move to Backlog"
            aria-label="Move task to backlog"
            onClick={() => {
              sounds.playPop();
              onMoveTask(task.id, "backlog");
            }}
            className="miro-tactile rounded p-1 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <Archive className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          title="Delete step"
          aria-label="Delete task"
          onClick={() => {
            sounds.playPop();
            onDeleteTask(task.id);
          }}
          className="miro-tactile rounded p-1 text-ink-muted hover:bg-status-danger-soft hover:text-status-danger-ink"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
