"use client";

import React, { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Doc, DocCategory } from "@/types/outterring";
import { parseTags } from "./scratchpad/constants";
import { DocSidebar } from "./scratchpad/DocSidebar";
import { DocEditorHeader } from "./scratchpad/DocEditorHeader";
import { DocEditorProperties } from "./scratchpad/DocEditorProperties";
import { DocContentEditor } from "./scratchpad/DocContentEditor";
import { useDocEditor } from "./scratchpad/useDocEditor";

interface ScratchpadProps {
  docs: Doc[];
  selectedDocId: string | null;
  onSelectDoc: (docId: string) => void;
  onCreateDoc: (template?: {
    title: string;
    content: string;
    category: DocCategory;
    tags: string[];
  }) => void;
  onUpdateDoc: (
    docId: string,
    patch: Partial<Pick<Doc, "title" | "content" | "category" | "is_pinned" | "tags">>
  ) => void;
  onDeleteDoc: (docId: string) => void;
  onExtractTasksFromDoc: (doc: Doc) => Promise<void>;
}

export function Scratchpad({
  docs,
  selectedDocId,
  onSelectDoc,
  onCreateDoc,
  onUpdateDoc,
  onDeleteDoc,
  onExtractTasksFromDoc,
}: ScratchpadProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | DocCategory>("all");
  const [editorMode, setEditorMode] = useState<"split" | "write" | "preview">("split");

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return docs.filter((doc) => {
      const catMatch = categoryFilter === "all" || doc.category === categoryFilter;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags.toLowerCase().includes(q)
      );
    });
  }, [docs, searchQuery, categoryFilter]);

  const activeDoc = useMemo(() => {
    if (selectedDocId) {
      const found = docs.find((d) => d.id === selectedDocId);
      if (found) return found;
    }
    return filteredDocs[0] || docs[0] || null;
  }, [docs, filteredDocs, selectedDocId]);

  const activeTags = useMemo(
    () => (activeDoc ? parseTags(activeDoc.tags) : []),
    [activeDoc]
  );

  const wordStats = useMemo(() => {
    if (!activeDoc?.content.trim()) return { words: 0, readMins: 1 };
    const words = activeDoc.content.trim().split(/\s+/).length;
    return { words, readMins: Math.max(1, Math.ceil(words / 200)) };
  }, [activeDoc?.content]);

  const {
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
  } = useDocEditor({
    activeDoc,
    activeTags,
    onUpdateDoc,
    onExtractTasksFromDoc,
  });

  return (
    <section
      aria-label="Docs and Notes"
      className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pt-3 pb-14 sm:px-6 sm:pt-5 lg:grid-cols-12"
    >
      <DocSidebar
        filteredDocs={filteredDocs}
        activeDocId={activeDoc?.id}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        onSearchChange={setSearchQuery}
        onCategoryFilterChange={setCategoryFilter}
        onSelectDoc={onSelectDoc}
        onCreateDoc={onCreateDoc}
      />

      <article className="card-elevated rounded-3xl px-5 py-6 sm:px-9 sm:py-7 lg:col-span-9">
        {activeDoc ? (
          <div className="mx-auto flex h-full max-w-4xl flex-col">
            <DocEditorHeader
              activeDoc={activeDoc}
              saveIndicator={saveIndicator}
              wordsCount={wordStats.words}
              editorMode={editorMode}
              isExtracting={isExtracting}
              copiedNotice={copiedNotice}
              onSetEditorMode={setEditorMode}
              onExtractTasks={handleExtract}
              onCopyMarkdown={handleCopyMarkdown}
              onDownloadMarkdown={handleDownloadMarkdown}
              onTogglePin={() => {
                sounds.playPop();
                triggerEdit(activeDoc.id, { is_pinned: activeDoc.is_pinned ? 0 : 1 });
              }}
              onDeleteDoc={onDeleteDoc}
            />

            <DocEditorProperties
              activeDoc={activeDoc}
              activeTags={activeTags}
              newTagInput={newTagInput}
              onTitleChange={(title) => triggerEdit(activeDoc.id, { title })}
              onCategoryChange={(category) => triggerEdit(activeDoc.id, { category })}
              onNewTagInputChange={setNewTagInput}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onInsertSnippet={handleInsertSnippet}
              showSnippetToolbar={editorMode === "write" || editorMode === "split"}
            />

            <DocContentEditor
              editorMode={editorMode}
              content={activeDoc.content}
              textareaRef={textareaRef}
              onChangeContent={(content) => triggerEdit(activeDoc.id, { content })}
              onToggleChecklistLine={handleToggleChecklistLine}
            />
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center p-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-well text-ink-muted">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-ink-secondary">
              No page selected
            </h3>
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                onCreateDoc();
              }}
              className="miro-tactile apple-btn-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Page</span>
            </button>
          </div>
        )}
      </article>
    </section>
  );
}
