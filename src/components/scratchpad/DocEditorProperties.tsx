"use client";

import React from "react";
import { Clock, Tag, X } from "lucide-react";
import type { Doc, DocCategory } from "@/types/outterring";

interface DocEditorPropertiesProps {
  activeDoc: Doc;
  activeTags: string[];
  newTagInput: string;
  onTitleChange: (title: string) => void;
  onCategoryChange: (category: DocCategory) => void;
  onNewTagInputChange: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onInsertSnippet: (snippet: string) => void;
  showSnippetToolbar: boolean;
}

const SNIPPET_TOOLS = [
  { label: "H2", snippet: "\n## Section Heading\n" },
  { label: "Checklist", snippet: "\n- [ ] Action item\n" },
  { label: "Callout", snippet: "\n> Key takeaway or constraint\n" },
  { label: "Code", snippet: "\n```ts\n// code block\n```\n" },
  { label: "Table", snippet: "\n| Item | Status | Notes |\n| --- | --- | --- |\n| Step 1 | Active | |\n" },
];

export function DocEditorProperties({
  activeDoc,
  activeTags,
  newTagInput,
  onTitleChange,
  onCategoryChange,
  onNewTagInputChange,
  onAddTag,
  onRemoveTag,
  onInsertSnippet,
  showSnippetToolbar,
}: DocEditorPropertiesProps) {
  return (
    <>
      <div className="mt-5">
        <label htmlFor="scratchpad-doc-title" className="sr-only">Page title</label>
        <input
          id="scratchpad-doc-title"
          type="text"
          value={activeDoc.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Page"
          className="w-full bg-transparent text-2xl font-bold tracking-tight text-ink-primary placeholder-ink-muted outline-none sm:text-[1.7rem]"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line-subtle pb-3.5 text-xs text-ink-secondary">
        <div className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
          <label htmlFor="doc-category-select" className="text-ink-muted">Category</label>
          <select
            id="doc-category-select"
            value={activeDoc.category}
            onChange={(e) => onCategoryChange(e.target.value as DocCategory)}
            className="auto-fit-select rounded-md border border-line-subtle bg-well px-2 py-0.5 text-xs font-medium capitalize text-ink-primary outline-none focus:border-accent"
          >
            <option value="architecture">Architecture</option>
            <option value="runbook">Runbook</option>
            <option value="meeting">Meeting</option>
            <option value="ideas">Ideas</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-well px-2.5 py-0.5 font-mono text-[11px] text-ink-secondary"
            >
              <span>#{tag}</span>
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => onRemoveTag(tag)}
                className="text-ink-muted hover:text-ink-primary"
              >
                <X className="h-2.5 w-2.5" aria-hidden="true" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={newTagInput}
            onChange={(e) => onNewTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddTag();
              }
            }}
            onBlur={onAddTag}
            placeholder="+ tag"
            aria-label="Add page tag"
            className="w-16 rounded border border-transparent bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-ink-primary placeholder-ink-muted outline-none focus:w-24 focus:border-line-subtle focus:bg-well"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-ink-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {new Date(activeDoc.updated_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}{" "}
            ·{" "}
            {new Date(activeDoc.updated_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {showSnippetToolbar && (
        <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px]">
          {SNIPPET_TOOLS.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={() => onInsertSnippet(tool.snippet)}
              className="rounded border border-line-subtle bg-well px-2 py-0.5 font-medium text-ink-secondary hover:border-line-strong hover:bg-hover hover:text-ink-primary"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
