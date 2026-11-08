"use client";

import React, { type RefObject } from "react";
import { AlertCircle, Zap } from "lucide-react";

interface TaskDetailFieldsProps {
  titleRef: RefObject<HTMLInputElement>;
  title: string;
  onTitleChange: (val: string) => void;
  kickstart: string;
  onKickstartChange: (val: string) => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  whyItMatters: string;
  onWhyItMattersChange: (val: string) => void;
}

export function TaskDetailFields({
  titleRef,
  title,
  onTitleChange,
  kickstart,
  onKickstartChange,
  description,
  onDescriptionChange,
  whyItMatters,
  onWhyItMattersChange,
}: TaskDetailFieldsProps) {
  return (
    <>
      <div className="field-group">
        <label htmlFor="inspector-title-input" className="field-label block text-xs font-medium text-ink-secondary">
          Title <span className="text-status-danger-ink">*</span>
        </label>
        <input
          ref={titleRef}
          id="inspector-title-input"
          type="text"
          required
          minLength={3}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-describedby="inspector-title-err"
          className="validated-input mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-sm font-medium text-ink-primary outline-none transition-colors focus:border-accent"
        />
        <div id="inspector-title-err" className="field-error-msg mt-1 items-center gap-1.5 text-xs text-status-danger-ink">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Title required (min 3 chars).</span>
        </div>
      </div>

      <div>
        <label htmlFor="inspector-kickstart" className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
          <Zap className="h-3.5 w-3.5 text-status-warn-ink" aria-hidden="true" />
          <span>Kickstart</span>
        </label>
        <input
          id="inspector-kickstart"
          type="text"
          value={kickstart}
          onChange={(e) => onKickstartChange(e.target.value)}
          placeholder="2-minute starter action..."
          className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="inspector-description" className="block text-xs font-medium text-ink-secondary">
          Description
        </label>
        <textarea
          id="inspector-description"
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Context or notes..."
          className="auto-fit-textarea mt-1 rounded-lg border border-line-subtle bg-card px-3 py-2 text-xs leading-relaxed text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="inspector-why" className="block text-xs font-medium text-ink-secondary">
          Outcome
        </label>
        <input
          id="inspector-why"
          type="text"
          value={whyItMatters}
          onChange={(e) => onWhyItMattersChange(e.target.value)}
          placeholder="Why it matters..."
          className="mt-1 w-full rounded-lg border border-line-subtle bg-card px-3 py-1.5 text-xs text-ink-primary placeholder-ink-muted outline-none transition-colors focus:border-accent"
        />
      </div>
    </>
  );
}
