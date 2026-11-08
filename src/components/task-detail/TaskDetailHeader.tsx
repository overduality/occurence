"use client";

import React from "react";
import { FileText, Trash2, X } from "lucide-react";
import { sounds } from "@/lib/sound";
import { formatIssueKey } from "@/lib/web-platform";
import type { KanbanColumn, Subtask, Task, TaskStatus } from "@/types/outterring";

interface TaskDetailHeaderProps {
  task: Task;
  status: TaskStatus;
  columns?: KanbanColumn[];
  taskSubtasks: Subtask[];
  onStatusChange: (status: TaskStatus) => void;
  onConvertTaskToDoc: (task: Task, taskSubtasks: Subtask[]) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
}

export function TaskDetailHeader({
  task,
  status,
  columns,
  taskSubtasks,
  onStatusChange,
  onConvertTaskToDoc,
  onDeleteTask,
  onClose,
}: TaskDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span
          id="issue-inspector-title"
          className="font-mono text-xs font-medium text-ink-muted"
        >
          {formatIssueKey(task.id)}
        </span>

        <label htmlFor="inspector-status-select" className="sr-only">
          Issue status
        </label>
        <select
          id="inspector-status-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          className="auto-fit-select rounded-full border border-line-subtle bg-well px-3 py-1 text-xs font-medium text-ink-primary outline-none focus:border-accent"
        >
          {columns && columns.length > 0 ? (
            columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))
          ) : (
            <>
              <option value="in_progress">In Progress</option>
              <option value="todo">To Do</option>
              <option value="backlog">Backlog</option>
              <option value="done">Done</option>
            </>
          )}
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            sounds.playPop();
            onConvertTaskToDoc(task, taskSubtasks);
            onClose();
          }}
          className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-ink-secondary hover:text-ink-primary"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          <span>To Doc</span>
        </button>

        <button
          type="button"
          title="Delete issue"
          aria-label="Delete issue"
          onClick={() => {
            sounds.playPop();
            onDeleteTask(task.id);
            onClose();
          }}
          className="miro-tactile rounded-full p-1.5 text-ink-muted hover:bg-status-danger-soft hover:text-status-danger-ink"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label="Close issue inspector"
          onClick={onClose}
          className="miro-tactile rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-ink-primary"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
