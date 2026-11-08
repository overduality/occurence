"use client";

import React, { useMemo } from "react";
import { renderInline } from "./markdown-inline";
import { MarkdownTable } from "./MarkdownTable";

export function MarkdownPreview({
  markdown,
  onToggleChecklistLine,
}: {
  markdown: string;
  onToggleChecklistLine?: (lineIndex: number) => void;
}) {
  const blocks = useMemo(() => {
    const lines = markdown.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) {
        i += 1;
        continue;
      }

      if (line.startsWith("```")) {
        const lang = line.slice(3).trim() || "text";
        const codeLines: string[] = [];
        i += 1;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i += 1;
        }
        i += 1;
        elements.push(
          <div key={`code-${i}`} className="my-3 overflow-hidden rounded-xl border border-line-subtle bg-well/70">
            {lang && (
              <div className="border-b border-line-subtle px-3 py-1 font-mono text-[11px] text-ink-muted">
                {lang}
              </div>
            )}
            <pre tabIndex={0} className="overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-ink-primary">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        continue;
      }

      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i += 1;
        }
        elements.push(<MarkdownTable key={`tbl-${i}`} keyId={`tbl-${i}`} tableLines={tableLines} />);
        continue;
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${i}`} className="heading-balance mt-6 mb-3 text-2xl font-bold tracking-tight text-ink-primary sm:text-[1.65rem]">
            {renderInline(line.slice(2))}
          </h1>
        );
        i += 1;
        continue;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${i}`} className="heading-balance mt-5 mb-2.5 text-lg font-semibold tracking-tight text-ink-primary">
            {renderInline(line.slice(3))}
          </h2>
        );
        i += 1;
        continue;
      }
      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${i}`} className="heading-balance mt-4 mb-2 text-sm font-semibold text-ink-primary">
            {renderInline(line.slice(4))}
          </h3>
        );
        i += 1;
        continue;
      }

      if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={`bq-${i}`} className="prose-pretty my-3 rounded-r-xl border-l-2 border-accent bg-accent-soft/25 py-2 px-3.5 text-xs leading-relaxed text-ink-secondary">
            {renderInline(line.slice(2))}
          </blockquote>
        );
        i += 1;
        continue;
      }

      if (line.trim() === "---" || line.trim() === "***") {
        elements.push(<hr key={`hr-${i}`} className="my-5 border-t border-line-subtle" />);
        i += 1;
        continue;
      }

      if (/^[-*]\s+\[[ xX]\]\s+/.test(line.trim())) {
        const checklistItems: Array<{ lineIdx: number; checked: boolean; text: string }> = [];
        while (i < lines.length && /^[-*]\s+\[[ xX]\]\s+/.test(lines[i].trim())) {
          const l = lines[i].trim();
          const isChecked = /^[-*]\s+\[[xX]\]/.test(l);
          const text = l.replace(/^[-*]\s+\[[ xX]\]\s+/, "");
          checklistItems.push({ lineIdx: i, checked: isChecked, text });
          i += 1;
        }

        elements.push(
          <ul key={`chk-${i}`} className="my-2.5 space-y-1.5 pl-1 text-sm">
            {checklistItems.map((item) => (
              <li key={item.lineIdx} className="flex items-start gap-2.5 text-xs leading-relaxed">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleChecklistLine?.(item.lineIdx)}
                  aria-label={`Mark checklist line ${item.text} ${item.checked ? "incomplete" : "complete"}`}
                  className="mt-1 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-line-strong"
                />
                <span className={item.checked ? "line-through text-ink-muted" : "text-ink-primary"}>
                  {renderInline(item.text)}
                </span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      if (/^([-*•]|\d+\.)\s+/.test(line.trim())) {
        const listItems: string[] = [];
        while (
          i < lines.length &&
          /^([-*•]|\d+\.)\s+/.test(lines[i].trim()) &&
          !/^[-*]\s+\[[ xX]\]\s+/.test(lines[i].trim())
        ) {
          listItems.push(lines[i].trim().replace(/^([-*•]|\d+\.)\s+/, ""));
          i += 1;
        }
        elements.push(
          <ul key={`list-${i}`} className="prose-pretty my-2.5 list-disc space-y-1.5 pl-5 text-sm text-ink-primary">
            {listItems.map((li, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInline(li)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      elements.push(
        <p key={`p-${i}`} className="prose-pretty my-2.5 text-sm leading-7 text-ink-primary">
          {renderInline(line)}
        </p>
      );
      i += 1;
    }

    return elements;
  }, [markdown, onToggleChecklistLine]);

  return <div>{blocks}</div>;
}
