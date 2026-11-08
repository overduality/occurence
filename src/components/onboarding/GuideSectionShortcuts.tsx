"use client";

import React from "react";
import { Command } from "lucide-react";

export function GuideSectionShortcuts() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="rounded-2xl border border-line-subtle bg-well/60 p-4">
        <div className="flex items-center gap-2">
          <Command className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink-primary">
            Keyboard-First Operability
          </h3>
        </div>
        <p className="prose-pretty mt-1 text-xs text-ink-secondary">
          Occuring can be operated entirely from your keyboard with sub-16ms response.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line-subtle bg-card">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line-subtle bg-well/50 text-ink-muted">
            <tr>
              <th className="py-2.5 px-4 font-medium">Shortcut</th>
              <th className="py-2.5 px-4 font-medium">Action</th>
              <th className="py-2.5 px-4 font-medium">Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle text-ink-primary">
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">⌘K / Ctrl+K</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Spotlight</td>
              <td className="py-2.5 px-4 text-ink-muted">Anywhere</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">Space</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Complete step</td>
              <td className="py-2.5 px-4 text-ink-muted">Focus HUD</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">E</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Inspect step</td>
              <td className="py-2.5 px-4 text-ink-muted">Focus HUD</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">1</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Focus HUD</td>
              <td className="py-2.5 px-4 text-ink-muted">Anywhere</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">2</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Sprint Board</td>
              <td className="py-2.5 px-4 text-ink-muted">Anywhere</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">3</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Docs &amp; Notes</td>
              <td className="py-2.5 px-4 text-ink-muted">Anywhere</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">G</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Ground</td>
              <td className="py-2.5 px-4 text-ink-muted">Anywhere</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 font-mono">
                <kbd className="rounded-md bg-well px-1.5 py-0.5">Esc</kbd>
              </td>
              <td className="py-2.5 px-4 font-medium">Dismiss</td>
              <td className="py-2.5 px-4 text-ink-muted">Any modal</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
