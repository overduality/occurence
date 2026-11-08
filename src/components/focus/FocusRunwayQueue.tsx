"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { sounds } from "@/lib/sound";
import { formatIssueKey } from "@/lib/web-platform";
import type { Task } from "@/types/outterring";

interface FocusRunwayQueueProps {
  todoTasks: Task[];
  onInspectTask: (task: Task) => void;
  onPromoteTask: (taskId: string) => void;
}

export function FocusRunwayQueue({
  todoTasks,
  onInspectTask,
  onPromoteTask,
}: FocusRunwayQueueProps) {
  if (todoTasks.length === 0) return null;

  return (
    <details className="card-elevated mt-3.5 rounded-2xl px-4 py-3 text-xs">
      <summary className="flex cursor-pointer select-none items-center justify-between text-ink-secondary hover:text-ink-primary">
        <span className="flex items-center gap-2 font-medium">
          <ChevronRight
            className="disclosure-chevron h-3.5 w-3.5 text-ink-muted transition-transform duration-150"
            aria-hidden="true"
          />
          <span>Queue ({todoTasks.length})</span>
        </span>
        <span className="font-mono text-[11px] text-ink-muted">Show</span>
      </summary>

      <ul className="mt-2.5 divide-y divide-line-subtle border-t border-line-subtle pt-2">
        {todoTasks.slice(0, 5).map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-2">
            <button
              type="button"
              onClick={() => onInspectTask(item)}
              className="flex min-w-0 items-center gap-2.5 text-left hover:underline"
            >
              <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                {formatIssueKey(item.id)}
              </span>
              <span className="truncate font-medium text-ink-primary">
                {item.title}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onPromoteTask(item.id);
              }}
              className="miro-tactile liquid-nav-bubble shrink-0 rounded-full px-3 py-1 text-[11px] font-medium text-ink-primary"
            >
              Focus
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
