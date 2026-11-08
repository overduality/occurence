import React from "react";
import { renderInline } from "./markdown-inline";

export function MarkdownTable({ tableLines, keyId }: { tableLines: string[]; keyId: string }) {
  const parseCells = (rowStr: string) =>
    rowStr
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());

  const headerCells = tableLines[0] ? parseCells(tableLines[0]) : [];
  const bodyLines = tableLines
    .slice(1)
    .filter((row) => !/^[|\s-:]+$/.test(row));

  return (
    <div key={keyId} className="my-3.5 overflow-x-auto rounded-xl border border-line-subtle bg-card">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-line-subtle bg-well/50 text-ink-muted">
          <tr>
            {headerCells.map((h, hIdx) => (
              <th key={hIdx} className="py-2.5 px-3.5 font-medium">
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-subtle">
          {bodyLines.map((rowStr, rIdx) => {
            const cells = parseCells(rowStr);
            return (
              <tr key={rIdx} className="hover:bg-hover/60">
                {cells.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-3.5 text-ink-primary">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
