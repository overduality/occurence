"use client";

import React from "react";
import type { Sprint, TaskPriority } from "@/types/outterring";

interface TaskMetadataGridProps {
  priority: TaskPriority;
  minutes: number;
  sprintId: string;
  sprints: Sprint[];
  onPriorityChange: (priority: TaskPriority) => void;
  onMinutesChange: (minutes: number) => void;
  onSprintIdChange: (sprintId: string) => void;
}

export function TaskMetadataGrid({
  priority,
  minutes,
  sprintId,
  sprints,
  onPriorityChange,
  onMinutesChange,
  onSprintIdChange,
}: TaskMetadataGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-line-subtle bg-well/60 p-3 sm:grid-cols-3">
      <div>
        <label
          htmlFor="inspector-priority"
          className="block text-[11px] font-medium text-ink-muted"
        >
          Priority
        </label>
        <select
          id="inspector-priority"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriority)}
          className="mt-1 w-full rounded-md border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="inspector-estimate"
          className="block text-[11px] font-medium text-ink-muted"
        >
          Estimate
        </label>
        <select
          id="inspector-estimate"
          value={minutes}
          onChange={(e) => onMinutesChange(Number(e.target.value))}
          className="mt-1 w-full rounded-md border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
        >
          <option value={5}>5 min</option>
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
          <option value={25}>25 min</option>
          <option value={30}>30 min</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="inspector-sprint"
          className="block text-[11px] font-medium text-ink-muted"
        >
          Sprint
        </label>
        <select
          id="inspector-sprint"
          value={sprintId}
          onChange={(e) => onSprintIdChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-line-subtle bg-card px-2.5 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
        >
          <option value="">No Sprint</option>
          {sprints.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
