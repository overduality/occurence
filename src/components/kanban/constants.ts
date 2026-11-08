import type { TaskPriority } from "@/types/outterring";

export const PRIORITY_BADGE: Record<
  TaskPriority,
  { label: string; dotClass: string; className: string }
> = {
  urgent: {
    label: "Urgent",
    dotClass: "bg-status-danger-ink",
    className: "bg-status-danger-soft text-status-danger-ink",
  },
  high: {
    label: "High",
    dotClass: "bg-status-warn-ink",
    className: "bg-status-warn-soft text-status-warn-ink",
  },
  medium: {
    label: "Medium",
    dotClass: "bg-accent",
    className: "bg-well text-ink-secondary",
  },
  low: {
    label: "Low",
    dotClass: "bg-ink-muted",
    className: "bg-well text-ink-muted",
  },
};

export const COLUMN_COLOR_MAP: Record<
  string,
  { dot: string; border: string; bg: string; badge: string }
> = {
  accent: {
    dot: "bg-accent",
    border: "border-accent",
    bg: "bg-accent-soft/45",
    badge: "bg-accent-soft text-accent",
  },
  muted: {
    dot: "bg-ink-muted",
    border: "border-line-subtle",
    bg: "bg-well/45",
    badge: "bg-card text-ink-secondary",
  },
  success: {
    dot: "bg-status-success-ink",
    border: "border-status-success-ink",
    bg: "bg-status-success-soft/30",
    badge: "bg-status-success-soft text-status-success-ink",
  },
  warn: {
    dot: "bg-status-warn-ink",
    border: "border-status-warn-ink",
    bg: "bg-status-warn-soft/30",
    badge: "bg-status-warn-soft text-status-warn-ink",
  },
  purple: {
    dot: "bg-purple-500",
    border: "border-purple-500",
    bg: "bg-purple-500/15",
    badge: "bg-purple-500/20 text-purple-400",
  },
  cyan: {
    dot: "bg-cyan-500",
    border: "border-cyan-500",
    bg: "bg-cyan-500/15",
    badge: "bg-cyan-500/20 text-cyan-400",
  },
  rose: {
    dot: "bg-rose-500",
    border: "border-rose-500",
    bg: "bg-rose-500/15",
    badge: "bg-rose-500/20 text-rose-400",
  },
};

export const AVAILABLE_COLORS = [
  { id: "accent", label: "Blue", bg: "bg-accent" },
  { id: "purple", label: "Purple", bg: "bg-purple-500" },
  { id: "cyan", label: "Cyan", bg: "bg-cyan-500" },
  { id: "success", label: "Green", bg: "bg-status-success-ink" },
  { id: "warn", label: "Amber", bg: "bg-status-warn-ink" },
  { id: "rose", label: "Rose", bg: "bg-rose-500" },
  { id: "muted", label: "Gray", bg: "bg-ink-muted" },
];
