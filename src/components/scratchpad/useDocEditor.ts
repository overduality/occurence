"use client";

import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sound";
import type { Doc } from "@/types/outterring";

export function useDocEditor({
  activeDoc,
  activeTags,
  onUpdateDoc,
  onExtractTasksFromDoc,
}: {
  activeDoc: Doc | null;
  activeTags: string[];
  onUpdateDoc: (
    docId: string,
    patch: Partial<Pick<Doc, "title" | "content" | "category" | "is_pinned" | "tags">>
  ) => void;
  onExtractTasksFromDoc: (doc: Doc) => Promise<void>;
}) {
  const [saveIndicator, setSaveIndicator] = useState<"saved" | "saving">("saved");
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const saveTimerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const triggerEdit = (
    docId: string,
    patch: Partial<Pick<Doc, "title" | "content" | "category" | "is_pinned" | "tags">>
  ) => {
    setSaveIndicator("saving");
    onUpdateDoc(docId, patch);
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      setSaveIndicator("saved");
    }, 350);
  };

  const handleToggleChecklistLine = (lineIndex: number) => {
    if (!activeDoc) return;
    const lines = activeDoc.content.split("\n");
    const target = lines[lineIndex];
    if (typeof target !== "string") return;

    if (/^(\s*[-*]\s+)\[ \]/.test(target)) {
      lines[lineIndex] = target.replace(/^(\s*[-*]\s+)\[ \]/, "$1[x]");
    } else if (/^(\s*[-*]\s+)\[[xX]\]/.test(target)) {
      lines[lineIndex] = target.replace(/^(\s*[-*]\s+)\[[xX]\]/, "$1[ ]");
    }
    triggerEdit(activeDoc.id, { content: lines.join("\n") });
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!activeDoc) return;
    sounds.playPop();
    const el = textareaRef.current;
    if (!el) {
      triggerEdit(activeDoc.id, {
        content: `${activeDoc.content.trimEnd()}\n\n${snippet}`,
      });
      return;
    }
    const start = el.selectionStart ?? activeDoc.content.length;
    const end = el.selectionEnd ?? activeDoc.content.length;
    const before = activeDoc.content.slice(0, start);
    const after = activeDoc.content.slice(end);
    const next = `${before}${snippet}${after}`;
    triggerEdit(activeDoc.id, { content: next });
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleAddTag = () => {
    if (!activeDoc) return;
    const clean = newTagInput.trim().toLowerCase().replace(/^#+/, "");
    if (!clean) return;
    if (!activeTags.includes(clean)) {
      sounds.playPop();
      const next = [...activeTags, clean];
      triggerEdit(activeDoc.id, { tags: JSON.stringify(next) });
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeDoc) return;
    sounds.playPop();
    const next = activeTags.filter((t) => t !== tagToRemove);
    triggerEdit(activeDoc.id, { tags: JSON.stringify(next) });
  };

  const handleCopyMarkdown = async () => {
    if (!activeDoc) return;
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      sounds.playPop();
      setCopiedNotice(true);
      window.setTimeout(() => setCopiedNotice(false), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  const handleDownloadMarkdown = () => {
    if (!activeDoc) return;
    sounds.playPop();
    const slug =
      activeDoc.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "occuring-doc";
    const blob = new Blob([activeDoc.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExtract = async () => {
    if (!activeDoc || isExtracting) return;
    setIsExtracting(true);
    sounds.playPop();
    try {
      await onExtractTasksFromDoc(activeDoc);
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    saveIndicator,
    isExtracting,
    copiedNotice,
    newTagInput,
    setNewTagInput,
    textareaRef,
    triggerEdit,
    handleToggleChecklistLine,
    handleInsertSnippet,
    handleAddTag,
    handleRemoveTag,
    handleCopyMarkdown,
    handleDownloadMarkdown,
    handleExtract,
  };
}
