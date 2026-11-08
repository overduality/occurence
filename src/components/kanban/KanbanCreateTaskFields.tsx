"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import type { KanbanColumn, TaskPriority, TaskStatus } from "@/types/outterring";

interface KanbanCreateTaskFieldsProps {
  title: string;
  kickstart: string;
  description: string;
  priority: TaskPriority;
  minutes: number;
  targetStatus: TaskStatus;
  boardColumns: KanbanColumn[];
  titleInputRef: React.RefObject<HTMLInputElement>;
  onTitleChange: (v: string) => void;
  onKickstartChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onPriorityChange: (v: TaskPriority) => void;
  onMinutesChange: (v: number) => void;
  onTargetStatusChange: (v: TaskStatus) => void;
}

export function KanbanCreateTaskFields({
  title,
  kickstart,
  description,
  priority,
  minutes,
  targetStatus,
  boardColumns,
  titleInputRef,
  onTitleChange,
  onKickstartChange,
  onDescriptionChange,
  onPriorityChange,
  onMinutesChange,
  onTargetStatusChange,
}: KanbanCreateTaskFieldsProps) {
  return (
    <div className="mt-4 space-y-3.5">
      <div className="field-group">
        <label htmlFor="task-title-input" className="field-label block text-xs font-medium text-ink-primary">
          Title <span className="text-status-danger-ink">*</span>
        </label>
        <input
          ref={titleInputRef}
          id="task-title-input"
          name="title"
          type="text"
          required
          minLength={3}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Action summary..."
          aria-describedby="task-title-error"
          className="validated-input mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-sm text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
        <div id="task-title-error" className="field-error-msg mt-1 items-center gap-1.5 text-xs text-status-danger-ink">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Title required (min 3 chars).</span>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="task-kickstart-input" className="field-label block text-xs font-medium text-ink-primary">
          Kickstart
        </label>
        <input
          id="task-kickstart-input"
          name="kickstart"
          type="text"
          value={kickstart}
          onChange={(e) => onKickstartChange(e.target.value)}
          placeholder="2-minute starter action..."
          className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="task-desc-input" className="block text-xs font-medium text-ink-primary">
          Description
        </label>
        <textarea
          id="task-desc-input"
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Context..."
          className="auto-fit-textarea mt-1 rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="task-priority-select" className="block text-xs font-medium text-ink-primary">
            Priority
          </label>
          <select
            id="task-priority-select"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-minutes-select" className="block text-xs font-medium text-ink-primary">
            Estimate
          </label>
          <select
            id="task-minutes-select"
            value={minutes}
            onChange={(e) => onMinutesChange(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          >
            <option value={5}>5m</option>
            <option value={10}>10m</option>
            <option value={15}>15m</option>
            <option value={25}>25m</option>
            <option value={30}>30m</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-lane-select" className="block text-xs font-medium text-ink-primary">
            Status
          </label>
          <select
            id="task-lane-select"
            value={targetStatus}
            onChange={(e) => onTargetStatusChange(e.target.value as TaskStatus)}
            className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          >
            {boardColumns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
