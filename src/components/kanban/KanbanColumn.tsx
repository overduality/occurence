"use client";

import React from "react";
import { ChevronRight, Sliders } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { KanbanColumn as IKanbanColumn, Sprint, Task, TaskStatus } from "@/types/outterring";
import { COLUMN_COLOR_MAP } from "./constants";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumnInlineAdd } from "./KanbanColumnInlineAdd";

interface KanbanColumnProps {
  col: IKanbanColumn;
  tasks: Task[];
  dragOverCol: string | null;
  subtaskStats: Map<string, { done: number; total: number }>;
  sprintMap: Map<string, Sprint>;
  sprintFilter: string;
  slicingTaskId: string | null;
  onDrop: (status: TaskStatus) => void;
  onDragOver: (colId: string) => void;
  onDragLeave: () => void;
  onClearCompleted: () => void;
  onOpenColumnEditor: (col: IKanbanColumn) => void;
  onInlineAdd: (status: TaskStatus, title: string) => void;
  onInspectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onSwitchToFocusHUD: () => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
}

export function KanbanColumn({
  col,
  tasks,
  dragOverCol,
  subtaskStats,
  sprintMap,
  sprintFilter,
  slicingTaskId,
  onDrop,
  onDragOver,
  onDragLeave,
  onClearCompleted,
  onOpenColumnEditor,
  onInlineAdd,
  onInspectTask,
  onMoveTask,
  onSwitchToFocusHUD,
  onSliceTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
}: KanbanColumnProps) {
  const colMeta = COLUMN_COLOR_MAP[col.color || "accent"] || COLUMN_COLOR_MAP.accent;
  const isOverLimit = typeof col.wip_limit === "number" && col.wip_limit > 0 && tasks.length > col.wip_limit;
  const isDoneCol = col.id === "done";
  const isDragTarget = dragOverCol === col.id;

  const renderTaskCard = (task: Task) => (
    <KanbanCard
      key={task.id}
      task={task}
      subCount={subtaskStats.get(task.id)}
      sprintMap={sprintMap}
      sprintFilter={sprintFilter}
      isSlicingThis={slicingTaskId === task.id}
      onInspectTask={onInspectTask}
      onMoveTask={onMoveTask}
      onSwitchToFocusHUD={onSwitchToFocusHUD}
      onSliceTask={onSliceTask}
      onDeleteTask={onDeleteTask}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(col.id);
      }}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(col.id as TaskStatus)}
      className={`board-column miro-frame-zone flex flex-col min-w-[280px] sm:min-w-[320px] max-w-[360px] flex-1 shrink-0 rounded-3xl p-3 transition-colors ${
        isDragTarget ? `${colMeta.border} ${colMeta.bg}` : "border-line-subtle"
      }`}
    >
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-2 w-2 shrink-0 rounded-full ${colMeta.dot}`} aria-hidden="true" />
          <h3 className="text-xs font-semibold text-ink-secondary truncate" title={col.title}>
            {col.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDoneCol && tasks.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onClearCompleted();
              }}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-ink-muted hover:bg-hover hover:text-ink-primary"
            >
              Clear
            </button>
          )}

          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium ${
              isOverLimit
                ? "border-status-danger-ink bg-status-danger-soft text-status-danger-ink"
                : "border-line-subtle bg-card text-ink-secondary"
            }`}
          >
            {tasks.length}
            {typeof col.wip_limit === "number" && col.wip_limit > 0 ? `/${col.wip_limit}` : ""}
          </span>

          <button
            type="button"
            aria-label={`Configure column ${col.title}`}
            onClick={() => onOpenColumnEditor(col)}
            className="miro-tactile rounded-full p-1 text-ink-muted hover:bg-hover hover:text-ink-primary"
          >
            <Sliders className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2.5">
        {tasks.length > 0 ? (
          <>
            {tasks.slice(0, 8).map(renderTaskCard)}
            {tasks.length > 8 && (
              <details className="rounded-lg border border-line-subtle bg-card p-2.5 text-xs">
                <summary className="flex cursor-pointer items-center justify-between font-medium text-ink-secondary hover:text-ink-primary">
                  <span className="flex items-center gap-1.5">
                    <ChevronRight className="disclosure-chevron h-3.5 w-3.5 text-ink-muted transition-transform" aria-hidden="true" />
                    <span>+{tasks.length - 8} more</span>
                  </span>
                </summary>
                <div className="mt-2.5 space-y-2 border-t border-line-subtle pt-2.5">
                  {tasks.slice(8).map(renderTaskCard)}
                </div>
              </details>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-line-strong bg-card/25 py-8 text-center">
            <p className="text-xs text-ink-muted">Empty</p>
          </div>
        )}
      </div>

      <KanbanColumnInlineAdd status={col.id as TaskStatus} onInlineAdd={onInlineAdd} />
    </div>
  );
}
