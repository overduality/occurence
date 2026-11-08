"use client";

import React from "react";
import {
  Check,
  Columns,
  Copy,
  Download,
  Edit3,
  Eye,
  ListTodo,
  Loader2,
  Pin,
  Trash2,
} from "lucide-react";
import { sounds } from "@/lib/sound";
import type { Doc } from "@/types/outterring";

interface DocEditorHeaderProps {
  activeDoc: Doc;
  saveIndicator: "saved" | "saving";
  wordsCount: number;
  editorMode: "split" | "write" | "preview";
  isExtracting: boolean;
  copiedNotice: boolean;
  onSetEditorMode: (mode: "split" | "write" | "preview") => void;
  onExtractTasks: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
  onTogglePin: () => void;
  onDeleteDoc: (id: string) => void;
}

export function DocEditorHeader({
  activeDoc,
  saveIndicator,
  wordsCount,
  editorMode,
  isExtracting,
  copiedNotice,
  onSetEditorMode,
  onExtractTasks,
  onCopyMarkdown,
  onDownloadMarkdown,
  onTogglePin,
  onDeleteDoc,
}: DocEditorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-3">
      <div className="flex items-center gap-2.5 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-status-success-ink" aria-hidden="true" />
          <span>{saveIndicator === "saving" ? "Saving..." : "Saved"}</span>
        </span>
        <span>·</span>
        <span className="font-mono text-[11px]">{wordsCount} words</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <div role="group" aria-label="Document view mode" className="flex items-center rounded-full bg-well p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onSetEditorMode("write")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
              editorMode === "write" ? "liquid-nav-bubble text-ink-primary" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Edit3 className="h-3 w-3" aria-hidden="true" />
            <span>Write</span>
          </button>
          <button
            type="button"
            onClick={() => onSetEditorMode("split")}
            className={`hidden items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors sm:flex ${
              editorMode === "split" ? "liquid-nav-bubble text-ink-primary" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Columns className="h-3 w-3" aria-hidden="true" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => onSetEditorMode("preview")}
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
              editorMode === "preview" ? "liquid-nav-bubble text-ink-primary" : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span>Read</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isExtracting}
          onClick={onExtractTasks}
          className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-hover disabled:opacity-50"
        >
          {isExtracting ? (
            <Loader2 className="spinner-smooth h-3.5 w-3.5 text-accent" aria-hidden="true" />
          ) : (
            <ListTodo className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          )}
          <span>Extract Tasks</span>
        </button>

        <button
          type="button"
          title="Copy Markdown"
          aria-label="Copy Markdown to clipboard"
          onClick={onCopyMarkdown}
          className="miro-tactile liquid-nav-bubble inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-ink-secondary hover:text-ink-primary"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copiedNotice && <span className="text-[11px]">Copied</span>}
        </button>

        <button
          type="button"
          title="Download .md file"
          aria-label="Download Markdown file"
          onClick={onDownloadMarkdown}
          className="miro-tactile liquid-nav-bubble rounded-full p-1.5 text-ink-secondary hover:text-ink-primary"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          title={activeDoc.is_pinned ? "Unpin page" : "Pin page"}
          aria-label={activeDoc.is_pinned ? "Unpin note" : "Pin note"}
          onClick={onTogglePin}
          className={`miro-tactile rounded-full p-1.5 ${
            activeDoc.is_pinned
              ? "bg-status-warn-soft text-status-warn-ink"
              : "liquid-nav-bubble text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Pin className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          title="Delete page"
          aria-label="Delete note"
          onClick={() => {
            sounds.playPop();
            onDeleteDoc(activeDoc.id);
          }}
          className="miro-tactile liquid-nav-bubble rounded-full p-1.5 text-ink-secondary hover:bg-status-danger-soft hover:text-status-danger-ink"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
