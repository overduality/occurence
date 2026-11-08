"use client";

import React, { type RefObject } from "react";
import { MarkdownPreview } from "./MarkdownPreview";

interface DocContentEditorProps {
  editorMode: "split" | "write" | "preview";
  content: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
  onChangeContent: (content: string) => void;
  onToggleChecklistLine: (lineIndex: number) => void;
}

export function DocContentEditor({
  editorMode,
  content,
  textareaRef,
  onChangeContent,
  onToggleChecklistLine,
}: DocContentEditorProps) {
  return (
    <div
      className={`mt-4 grid flex-1 gap-5 ${
        editorMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {(editorMode === "write" || editorMode === "split") && (
        <div className="flex flex-col">
          <label htmlFor="scratchpad-doc-body" className="sr-only">
            Markdown content
          </label>
          <textarea
            ref={textareaRef}
            id="scratchpad-doc-body"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            placeholder="Write Markdown or notes..."
            className="min-h-[430px] w-full flex-1 resize-none rounded-lg border border-line-subtle bg-well/45 p-4 font-mono text-[13px] leading-relaxed text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent focus:bg-card"
          />
        </div>
      )}

      {(editorMode === "preview" || editorMode === "split") && (
        <div
          className={`min-h-[430px] overflow-y-auto ${
            editorMode === "split"
              ? "rounded-lg border border-line-subtle bg-card p-5"
              : "py-1"
          }`}
        >
          <MarkdownPreview
            markdown={content}
            onToggleChecklistLine={onToggleChecklistLine}
          />
        </div>
      )}
    </div>
  );
}
