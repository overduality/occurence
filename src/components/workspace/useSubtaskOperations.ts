"use client";

import { useCallback } from "react";
import { ensurePhysicalVerb } from "@/lib/ai";
import { yieldToMain } from "@/lib/web-platform";
import type { Subtask } from "@/types/outterring";

interface SubtaskOperationsProps {
  subtasks: Subtask[];
  setSubtasks: React.Dispatch<React.SetStateAction<Subtask[]>>;
}

export function useSubtaskOperations({
  subtasks,
  setSubtasks,
}: SubtaskOperationsProps) {
  const handleToggleSubtask = useCallback((subtaskId: string, completed: boolean) => {
    const val = completed ? 1 : 0;
    setSubtasks((curr) =>
      curr.map((s) => (s.id === subtaskId ? { ...s, is_completed: val } : s))
    );

    void (async () => {
      await yieldToMain();
      await fetch("/api/subtasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subtaskId, is_completed: val }),
      });
    })();
  }, [setSubtasks]);

  const handleRenameSubtask = useCallback((subtaskId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    setSubtasks((curr) =>
      curr.map((s) => (s.id === subtaskId ? { ...s, title: clean } : s))
    );

    void (async () => {
      await yieldToMain();
      await fetch("/api/subtasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subtaskId, title: clean }),
      });
    })();
  }, [setSubtasks]);

  const handleDeleteSubtask = useCallback(
    (subtaskId: string) => {
      const prev = subtasks;
      setSubtasks((curr) => curr.filter((s) => s.id !== subtaskId));

      void (async () => {
        await yieldToMain();
        const res = await fetch(
          `/api/subtasks?id=${encodeURIComponent(subtaskId)}`,
          { method: "DELETE" }
        );
        if (!res.ok) setSubtasks(prev);
      })();
    },
    [subtasks, setSubtasks]
  );

  const handleAddSubtask = useCallback((taskId: string, rawTitle: string) => {
    const tempId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cleanTitle = ensurePhysicalVerb(rawTitle);

    setSubtasks((curr) => [
      ...curr,
      {
        id: tempId,
        task_id: taskId,
        title: cleanTitle,
        is_completed: 0,
        order_idx: curr.length,
      },
    ]);

    void (async () => {
      await yieldToMain();
      await fetch("/api/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tempId, task_id: taskId, title: cleanTitle }),
      });
    })();
  }, [setSubtasks]);

  return {
    handleToggleSubtask,
    handleRenameSubtask,
    handleDeleteSubtask,
    handleAddSubtask,
  };
}
