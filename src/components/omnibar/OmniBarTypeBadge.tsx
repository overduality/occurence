import React from "react";
import { CheckCircle2, FileText, Layers } from "lucide-react";

export function OmniBarTypeBadge({
  text,
  resolvedType,
}: {
  text: string;
  resolvedType: "task" | "sprint" | "doc";
}) {
  if (!text.trim()) return null;

  if (resolvedType === "doc") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-well px-2 py-0.5 font-medium text-ink-primary">
        <FileText className="h-3 w-3 text-accent" aria-hidden="true" />
        <span>Doc</span>
      </span>
    );
  }

  if (resolvedType === "sprint") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-well px-2 py-0.5 font-medium text-ink-primary">
        <Layers className="h-3 w-3 text-status-warn-ink" aria-hidden="true" />
        <span>Sprint</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded bg-well px-2 py-0.5 font-medium text-ink-primary">
      <CheckCircle2 className="h-3 w-3 text-status-success-ink" aria-hidden="true" />
      <span>Task</span>
    </span>
  );
}
