"use client";

import { useCallback } from "react";
import { deriveKickstart } from "@/lib/ai";
import { yieldToMain } from "@/lib/web-platform";
import type { DailyMetrics, Task, TaskPriority, TaskStatus } from "@/types/outterring";

interface TaskDetailUpdateProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  todayMetrics: DailyMetrics;
  setTodayMetrics: React.Dispatch<React.SetStateAction<DailyMetrics>>;
  showNotice: (msg: string) => void;
}

export function useTaskDetailUpdate({
  tasks,
  setTasks,
  todayMetrics,
  setTodayMetrics,
  showNotice,
}: TaskDetailUpdateProps) {
  const handleSaveTaskDetails = useCallback(
    (
      taskId: string,
      patch: {
        title: string;
        description: string;
        kickstart_action: string;
        why_it_matters: string;
        status: TaskStatus;
        priority: TaskPriority;
        estimated_minutes: number;
        sprint_id: string | null;
      }
    ) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;

      const prevTasks = tasks;
      const prevMetrics = todayMetrics;
      const now = Date.now();
      const cleanTitle = patch.title.trim() || target.title;
      const cleanKickstart = patch.kickstart_action.trim() || deriveKickstart(cleanTitle);

      setTasks((curr) =>
        curr.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              ...patch,
              title: cleanTitle,
              kickstart_action: cleanKickstart,
              completed_at: patch.status === "done" ? target.completed_at ?? now : null,
              updated_at: now,
            };
          }
          if (patch.status === "in_progress" && t.status === "in_progress") {
            return { ...t, status: "todo" as const, updated_at: now };
          }
          return t;
        })
      );

      if (patch.status === "done" && target.status !== "done") {
        setTodayMetrics((m) => ({
          ...m,
          tasks_completed: m.tasks_completed + 1,
          focus_minutes: m.focus_minutes + (patch.estimated_minutes || 10),
        }));
      } else if (patch.status !== "done" && target.status === "done") {
        setTodayMetrics((m) => ({
          ...m,
          tasks_completed: Math.max(0, m.tasks_completed - 1),
          focus_minutes: Math.max(0, m.focus_minutes - (target.estimated_minutes || 10)),
        }));
      }

      showNotice("Updated");

      void (async () => {
        await yieldToMain();
        try {
          const res = await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: taskId,
              ...patch,
              title: cleanTitle,
              kickstart_action: cleanKickstart,
            }),
          });
          if (!res.ok) throw new Error("PATCH failed");
          const data = (await res.json()) as { tasks?: Task[]; todayMetrics?: DailyMetrics };
          if (data.tasks) setTasks(data.tasks);
          if (data.todayMetrics) setTodayMetrics(data.todayMetrics);
        } catch {
          setTasks(prevTasks);
          setTodayMetrics(prevMetrics);
        }
      })();
    },
    [tasks, todayMetrics, setTasks, setTodayMetrics, showNotice]
  );

  return { handleSaveTaskDetails };
}
