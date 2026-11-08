"use client";

import { useCallback } from "react";
import { sounds } from "@/lib/sound";
import { deriveKickstart, ensurePhysicalVerb } from "@/lib/ai";
import { yieldToMain } from "@/lib/web-platform";
import type {
  DailyMetrics,
  Sprint,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
  WorkspaceSnapshot,
} from "@/types/outterring";

interface TaskLifecycleProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  subtasks: Subtask[];
  setSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>;
  activeSprint: Sprint | null;
  inspectedTaskId: string | null;
  setInspectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  setTodayMetrics: React.Dispatch<React.SetStateAction<DailyMetrics>>;
  showNotice: (msg: string) => void;
  applySnapshot: (snapshot: WorkspaceSnapshot) => void;
}

export function useTaskLifecycle({
  tasks,
  setTasks,
  subtasks,
  setSubtasks,
  activeSprint,
  inspectedTaskId,
  setInspectedTaskId,
  setTodayMetrics,
  showNotice,
  applySnapshot,
}: TaskLifecycleProps) {
  const handleCreateTask = useCallback(
    (payload: {
      title: string;
      description: string;
      priority: TaskPriority;
      estimated_minutes: number;
      kickstart_action: string;
      status: TaskStatus;
      sprint_id?: string | null;
    }) => {
      const now = Date.now();
      const id = `task-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const cleanTitle = ensurePhysicalVerb(payload.title);
      const cleanKickstart = payload.kickstart_action || deriveKickstart(cleanTitle);
      const resolvedSprintId =
        payload.sprint_id !== undefined ? payload.sprint_id : (activeSprint?.id ?? null);

      const optimisticTask: Task = {
        id,
        title: cleanTitle,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        estimated_minutes: payload.estimated_minutes,
        why_it_matters: "Maintains focused single-step momentum.",
        kickstart_action: cleanKickstart,
        kickstart_completed: 0,
        sprint_id: resolvedSprintId,
        order_idx: 0,
        created_at: now,
        updated_at: now,
        completed_at: null,
      };

      setTasks((curr) => {
        const demoted =
          payload.status === "in_progress"
            ? curr.map((t) => (t.status === "in_progress" ? { ...t, status: "todo" as const } : t))
            : curr;
        return [optimisticTask, ...demoted];
      });

      void (async () => {
        await yieldToMain();
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            ...payload,
            title: cleanTitle,
            kickstart_action: cleanKickstart,
            sprint_id: resolvedSprintId,
            enforcePhysicalVerb: true,
          }),
        });
      })();
    },
    [activeSprint, setTasks]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      const prev = tasks;
      if (inspectedTaskId === taskId) {
        setInspectedTaskId(null);
      }
      setTasks((curr) => curr.filter((t) => t.id !== taskId));
      setSubtasks((curr) => curr.filter((s) => s.task_id !== taskId));

      void (async () => {
        await yieldToMain();
        const res = await fetch(`/api/tasks?id=${encodeURIComponent(taskId)}`, { method: "DELETE" });
        if (!res.ok) setTasks(prev);
      })();
    },
    [inspectedTaskId, tasks, setTasks, setSubtasks, setInspectedTaskId]
  );

  const handleClearCompleted = useCallback(() => {
    const doneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
    if (doneIds.size === 0) return;

    const prevTasks = tasks;
    const prevSubtasks = subtasks;
    setTasks((curr) => curr.filter((t) => t.status !== "done"));
    setSubtasks((curr) => curr.filter((s) => !doneIds.has(s.task_id)));
    showNotice(`Cleared ${doneIds.size} completed.`);

    void (async () => {
      await yieldToMain();
      const res = await fetch("/api/tasks?clearDone=1", { method: "DELETE" });
      if (!res.ok) {
        setTasks(prevTasks);
        setSubtasks(prevSubtasks);
      }
    })();
  }, [tasks, subtasks, setTasks, setSubtasks, showNotice]);

  const handleRecordFocusMinutes = useCallback(
    (minutes: number) => {
      if (minutes <= 0) return;
      setTodayMetrics((m) => ({ ...m, focus_minutes: m.focus_minutes + minutes }));
      showNotice(`+${minutes}m logged`);

      void (async () => {
        await yieldToMain();
        const res = await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add_focus_minutes: minutes }),
        });
        if (res.ok) {
          const data = (await res.json()) as { todayMetrics?: DailyMetrics };
          if (data.todayMetrics) setTodayMetrics(data.todayMetrics);
        }
      })();
    },
    [setTodayMetrics, showNotice]
  );

  const handleSliceTask = useCallback(
    async (taskId: string) => {
      const res = await fetch("/api/ai/slice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "task", taskId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { slicedCount: number; snapshot: WorkspaceSnapshot };
        sounds.playComplete();
        applySnapshot(data.snapshot);
        showNotice(`Sliced into ${data.slicedCount} steps`);
      }
    },
    [applySnapshot, showNotice]
  );

  return {
    handleCreateTask,
    handleDeleteTask,
    handleClearCompleted,
    handleRecordFocusMinutes,
    handleSliceTask,
  };
}
