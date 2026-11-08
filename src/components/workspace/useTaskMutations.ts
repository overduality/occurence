"use client";

import { useCallback } from "react";
import { sounds } from "@/lib/sound";
import { yieldToMain } from "@/lib/web-platform";
import type { DailyMetrics, Task, TaskStatus } from "@/types/outterring";
import { useTaskDetailUpdate } from "./useTaskDetailUpdate";

interface TaskMutationsProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  todayMetrics: DailyMetrics;
  setTodayMetrics: React.Dispatch<React.SetStateAction<DailyMetrics>>;
  showNotice: (msg: string) => void;
}

export function useTaskMutations({
  tasks,
  setTasks,
  todayMetrics,
  setTodayMetrics,
  showNotice,
}: TaskMutationsProps) {
  const handleMoveTask = useCallback(
    (taskId: string, newStatus: TaskStatus, autoPromoteNext = true) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return;

      const prevTasks = tasks;
      const prevMetrics = todayMetrics;
      const now = Date.now();

      if (newStatus === "done") {
        sounds.playComplete();
      } else {
        sounds.playPop();
      }

      setTasks((curr) => {
        let next = curr.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: newStatus,
              completed_at: newStatus === "done" ? now : null,
              updated_at: now,
            };
          }
          if (newStatus === "in_progress" && t.status === "in_progress") {
            return { ...t, status: "todo" as const, updated_at: now };
          }
          return t;
        });

        if (newStatus === "done" && autoPromoteNext && !next.some((t) => t.status === "in_progress")) {
          const firstTodo = next.find((t) => t.status === "todo");
          if (firstTodo) {
            next = next.map((t) =>
              t.id === firstTodo.id ? { ...t, status: "in_progress" as const, updated_at: now } : t
            );
          }
        }
        return next;
      });

      if (newStatus === "done" && target.status !== "done") {
        setTodayMetrics((m) => ({
          ...m,
          tasks_completed: m.tasks_completed + 1,
          focus_minutes: m.focus_minutes + (target.estimated_minutes || 10),
        }));
      } else if (newStatus !== "done" && target.status === "done") {
        setTodayMetrics((m) => ({
          ...m,
          tasks_completed: Math.max(0, m.tasks_completed - 1),
          focus_minutes: Math.max(0, m.focus_minutes - (target.estimated_minutes || 10)),
        }));
      }

      void (async () => {
        await yieldToMain();
        try {
          const res = await fetch("/api/tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: taskId, status: newStatus, autoPromoteNext }),
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
    [tasks, todayMetrics, setTasks, setTodayMetrics]
  );

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      handleMoveTask(taskId, "done", true);
      showNotice("Completed");
    },
    [handleMoveTask, showNotice]
  );

  const handleToggleKickstart = useCallback((taskId: string, completed: boolean) => {
    const val = completed ? 1 : 0;
    setTasks((curr) => curr.map((t) => (t.id === taskId ? { ...t, kickstart_completed: val } : t)));
    void (async () => {
      await yieldToMain();
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, kickstart_completed: val }),
      });
    })();
  }, [setTasks]);

  const detailUpdate = useTaskDetailUpdate({
    tasks,
    setTasks,
    todayMetrics,
    setTodayMetrics,
    showNotice,
  });

  return {
    handleMoveTask,
    handleCompleteTask,
    handleToggleKickstart,
    ...detailUpdate,
  };
}
