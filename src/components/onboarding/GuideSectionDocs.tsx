"use client";

import React from "react";
import { FileText } from "lucide-react";

export function GuideSectionDocs() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-line-subtle bg-well/60 p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-status-success-ink" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-primary">
            Confluence &amp; Notion-Style Knowledge
          </h3>
        </div>
        <p className="prose-pretty mt-1.5 text-xs leading-relaxed text-ink-secondary">
          Your Scratchpad holds specs, meeting notes, and runbooks. It links directly to your sprint execution runway.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            Interactive Clickable Checklists
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            In <strong>Split</strong> or <strong>Read</strong> mode, click any <kbd className="rounded bg-well px-1 text-[10px]">- [ ]</kbd> checkbox in the rendered preview. It will automatically update the underlying Markdown source to <kbd className="rounded bg-well px-1 text-[10px]">- [x]</kbd>!
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            1-Click Task Extraction
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Written a plan or runbook? Click <strong>Extract Tasks</strong>. Occuring slices the bullet points and checkboxes into actionable steps anchored directly onto your Sprint Board.
          </p>
        </div>

        <div className="rounded-2xl border border-line-subtle bg-card p-3.5">
          <span className="font-semibold text-xs text-ink-primary">
            Built-in Templates
          </span>
          <p className="mt-1 text-xs text-ink-secondary leading-relaxed">
            Use the <strong>+ADR</strong>, <strong>+Runbook</strong>, or <strong>+Meeting</strong> buttons in the sidebar to scaffold pre-formatted engineering documents in 1 click.
          </p>
        </div>
      </div>
    </div>
  );
}
