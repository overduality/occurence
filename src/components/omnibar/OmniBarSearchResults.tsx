"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { sounds } from "@/lib/sound";

export interface OmniBarSearchHit {
  kind: "task" | "doc";
  id: string;
  code: string;
  title: string;
  subtitle: string;
}

interface OmniBarSearchResultsProps {
  items: OmniBarSearchHit[];
  selectedIndex: number;
  onSelectItem: (item: OmniBarSearchHit) => void;
}

export function OmniBarSearchResults({
  items,
  selectedIndex,
  onSelectItem,
}: OmniBarSearchResultsProps) {
  if (items.length === 0) return null;

  return (
    <search
      aria-label="Matching workspace items"
      className="mt-3.5 border-t border-line-subtle pt-3"
    >
      <p className="mb-1.5 px-1 text-[11px] font-medium text-ink-muted">
        Jump to
      </p>
      <ul className="space-y-1">
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <li key={`${item.kind}-${item.id}`}>
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onSelectItem(item);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? "bg-accent-soft text-ink-primary"
                    : "text-ink-primary hover:bg-hover"
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <span className="shrink-0 rounded border border-line-subtle bg-well px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-muted">
                    {item.code}
                  </span>
                  <span className="truncate font-medium">{item.title}</span>
                </span>
                <span className="ml-3 flex shrink-0 items-center gap-1 text-[11px] text-ink-muted">
                  <span>{item.subtitle}</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </search>
  );
}
