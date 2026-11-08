"use client";

import { useCallback } from "react";
import { formatIssueKey, yieldToMain } from "@/lib/web-platform";
import type { DailyMetrics, Doc, Sprint, Subtask, Task, WorkspaceTab } from "@/types/outterring";

interface DocExportAndConvertProps {
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  setSelectedDocId: React.Dispatch<React.SetStateAction<string | null>>;
  navigateToTab: (tab: WorkspaceTab) => void;
  showNotice: (msg: string) => void;
  todayMetrics: DailyMetrics;
  sprints: Sprint[];
  tasks: Task[];
  subtasks: Subtask[];
  docs: Doc[];
}

export function useDocExportAndConvert({
  setDocs,
  setSelectedDocId,
  navigateToTab,
  showNotice,
  todayMetrics,
  sprints,
  tasks,
  subtasks,
  docs,
}: DocExportAndConvertProps) {
  const handleConvertTaskToDoc = useCallback(
    (task: Task, taskSubtasks: Subtask[]) => {
      const now = Date.now();
      const id = `doc-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const issueKey = formatIssueKey(task.id);
      const checklistLines =
        taskSubtasks.length > 0
          ? taskSubtasks
              .map((s) => `- [${s.is_completed === 1 ? "x" : " "}] ${s.title}`)
              .join("\n")
          : `- [ ] ${task.title}`;

      const contentParts = [
        `# ${task.title}`,
        task.description ? task.description : "",
        task.kickstart_action ? `> 2-Min Kickstart: ${task.kickstart_action}` : "",
        task.why_it_matters ? `Outcome: ${task.why_it_matters}` : "",
        `## Execution Checklist\n${checklistLines}`,
      ].filter(Boolean);

      const tagsList = [issueKey.toLowerCase(), task.priority];
      const newDoc: Doc = {
        id,
        title: `${issueKey}: ${task.title}`,
        content: contentParts.join("\n\n"),
        category: "architecture",
        tags: JSON.stringify(tagsList),
        is_pinned: 0,
        created_at: now,
        updated_at: now,
      };

      setDocs((curr) => [newDoc, ...curr]);
      setSelectedDocId(id);
      navigateToTab("docs");
      showNotice(`Created ${issueKey} in Docs`);

      void (async () => {
        await yieldToMain();
        await fetch("/api/docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newDoc, tags: tagsList, createNew: true }),
        });
      })();
    },
    [navigateToTab, setDocs, setSelectedDocId, showNotice]
  );

  const handleExportWorkspace = useCallback(() => {
    const payload = {
      app: "Occuring",
      exportedAt: new Date().toISOString(),
      todayMetrics,
      sprints,
      tasks,
      subtasks,
      docs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `occuring-workspace-${todayMetrics.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Workspace exported");
  }, [docs, showNotice, sprints, subtasks, tasks, todayMetrics]);

  return {
    handleConvertTaskToDoc,
    handleExportWorkspace,
  };
}
