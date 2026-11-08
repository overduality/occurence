"use client";

import { useCallback, useRef } from "react";
import { sounds } from "@/lib/sound";
import { yieldToMain } from "@/lib/web-platform";
import type {
  DailyMetrics,
  Doc,
  DocCategory,
  Sprint,
  Subtask,
  Task,
  WorkspaceSnapshot,
  WorkspaceTab,
} from "@/types/outterring";
import { useDocExportAndConvert } from "./useDocExportAndConvert";

interface DocOperationsProps {
  docs: Doc[];
  setDocs: React.Dispatch<React.SetStateAction<Doc[]>>;
  selectedDocId: string | null;
  setSelectedDocId: React.Dispatch<React.SetStateAction<string | null>>;
  navigateToTab: (tab: WorkspaceTab) => void;
  showNotice: (msg: string) => void;
  applySnapshot: (snapshot: WorkspaceSnapshot, destinationTab?: WorkspaceTab) => void;
  todayMetrics: DailyMetrics;
  sprints: Sprint[];
  tasks: Task[];
  subtasks: Subtask[];
}

export function useDocOperations({
  docs,
  setDocs,
  selectedDocId,
  setSelectedDocId,
  navigateToTab,
  showNotice,
  applySnapshot,
  todayMetrics,
  sprints,
  tasks,
  subtasks,
}: DocOperationsProps) {
  const docPatchTimerRef = useRef<Record<string, number>>({});

  const handleCreateDoc = useCallback(
    (template?: {
      title: string;
      content: string;
      category: DocCategory;
      tags: string[];
    }) => {
      const now = Date.now();
      const id = `doc-${now}-${Math.random().toString(36).slice(2, 6)}`;
      const tagsList = template?.tags ?? ["notes"];
      const newDoc: Doc = {
        id,
        title: template?.title ?? "Untitled Page",
        content: template?.content ?? "# Overview\n\n- ",
        category: template?.category ?? "general",
        tags: JSON.stringify(tagsList),
        is_pinned: 0,
        created_at: now,
        updated_at: now,
      };

      setDocs((curr) => [newDoc, ...curr]);
      setSelectedDocId(id);

      void (async () => {
        await yieldToMain();
        await fetch("/api/docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newDoc, tags: tagsList, createNew: true }),
        });
      })();
    },
    [setDocs, setSelectedDocId]
  );

  const handleUpdateDoc = useCallback(
    (
      docId: string,
      patch: Partial<Pick<Doc, "title" | "content" | "category" | "is_pinned" | "tags">>
    ) => {
      const now = Date.now();
      setDocs((curr) =>
        curr.map((d) => (d.id === docId ? { ...d, ...patch, updated_at: now } : d))
      );

      if (docPatchTimerRef.current[docId]) {
        window.clearTimeout(docPatchTimerRef.current[docId]);
      }

      docPatchTimerRef.current[docId] = window.setTimeout(() => {
        void fetch("/api/docs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: docId, ...patch }),
        });
      }, 280);
    },
    [setDocs]
  );

  const handleDeleteDoc = useCallback(
    (docId: string) => {
      const prev = docs;
      setDocs((curr) => curr.filter((d) => d.id !== docId));
      if (selectedDocId === docId) {
        const remaining = docs.filter((d) => d.id !== docId);
        setSelectedDocId(remaining[0]?.id ?? null);
      }

      void (async () => {
        await yieldToMain();
        const res = await fetch(`/api/docs?id=${encodeURIComponent(docId)}`, {
          method: "DELETE",
        });
        if (!res.ok) setDocs(prev);
      })();
    },
    [docs, selectedDocId, setDocs, setSelectedDocId]
  );

  const handleExtractTasksFromDoc = useCallback(
    async (doc: Doc) => {
      const res = await fetch("/api/ai/slice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "doc",
          docId: doc.id,
          title: doc.title,
          content: doc.content,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          extractedCount: number;
          snapshot: WorkspaceSnapshot;
        };
        sounds.playComplete();
        applySnapshot(data.snapshot, "board");
        showNotice(`Extracted ${data.extractedCount} steps`);
      }
    },
    [applySnapshot, showNotice]
  );

  const exportAndConvert = useDocExportAndConvert({
    setDocs,
    setSelectedDocId,
    navigateToTab,
    showNotice,
    todayMetrics,
    sprints,
    tasks,
    subtasks,
    docs,
  });

  return {
    handleCreateDoc,
    handleUpdateDoc,
    handleDeleteDoc,
    handleExtractTasksFromDoc,
    ...exportAndConvert,
  };
}
