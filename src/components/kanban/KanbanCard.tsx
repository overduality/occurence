"use client";

import React from "react";
import { CheckSquare, Clock, Pencil } from "lucide-react";
import { sounds } from "@/lib/sound";
import { formatIssueKey } from "@/lib/web-platform";
import type { Sprint, Task, TaskStatus } from "@/types/outterring";
import { PRIORITY_BADGE } from "./constants";
import { KanbanCardFooter } from "./KanbanCardFooter";

interface KanbanCardProps {
  task: Task;
  subCount?: { done: number; total: number };
  sprintMap: Map<string, Sprint>;
  sprintFilter: string;
  isSlicingThis: boolean;
  onInspectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onSwitchToFocusHUD: () => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

export function KanbanCard({
  task,
  subCount,
  sprintMap,
  sprintFilter,
  isSlicingThis,
  onInspectTask,
  onMoveTask,
  onSwitchToFocusHUD,
  onSliceTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const isDone = task.status === "done";
  const isActive = task.status === "in_progress";
  const priorityInfo = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium;
  const issueKey = formatIssueKey(task.id);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      className={`kanban-card-container miro-card-interactive group cursor-grab rounded-2xl p-3.5 active:cursor-grabbing ${
        isActive ? "ring-2 ring-accent" : isDone ? "opacity-75 hover:opacity-100" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onInspectTask(task);
          }}
          className={`text-left text-[13.5px] font-medium leading-snug hover:text-accent ${
            isDone ? "line-through text-ink-muted" : "text-ink-primary"
          }`}
        >
          {task.title}
        </button>

        <button
          type="button"
          title="Edit issue details"
          aria-label={`Edit ${issueKey}`}
          onClick={() => {
            sounds.playPop();
            onInspectTask(task);
          }}
          className="shrink-0 rounded p-1 text-ink-muted opacity-0 transition-opacity hover:bg-hover hover:text-ink-primary focus:opacity-100 group-hover:opacity-100"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-medium text-ink-muted">{issueKey}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${priorityInfo.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${priorityInfo.dotClass}`} aria-hidden="true" />
            <span>{priorityInfo.label}</span>
          </span>

          {subCount && subCount.total > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted">
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              <span>
                {subCount.done}/{subCount.total}
              </span>
            </span>
          )}

          {sprintFilter === "all" && task.sprint_id && (
            <span className="inline-flex max-w-[120px] truncate rounded-full bg-well px-2 py-0.5 text-[10px] font-medium text-ink-muted">
              {sprintMap.get(task.sprint_id)?.title || "Sprint"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
          {task.kickstart_action && (
            <span title={task.kickstart_action} className="text-status-warn-ink">
              ⚡
            </span>
          )}
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{task.estimated_minutes}m</span>
        </div>
      </div>

      <KanbanCardFooter
        task={task}
        isSlicingThis={isSlicingThis}
        onInspectTask={onInspectTask}
        onMoveTask={onMoveTask}
        onSwitchToFocusHUD={onSwitchToFocusHUD}
        onSliceTask={onSliceTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}
