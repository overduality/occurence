import type { Task } from "@/types/outterring";

export const TIMER_PRESETS = [
  { label: "2m", minutes: 2, seconds: 120 },
  { label: "10m", minutes: 10, seconds: 600 },
  { label: "25m", minutes: 25, seconds: 1500 },
] as const;

export const PRIORITY_STYLES: Record<
  Task["priority"],
  { label: string; dotClass: string; badgeClass: string }
> = {
  urgent: {
    label: "Urgent",
    dotClass: "bg-status-danger-ink",
    badgeClass: "bg-status-danger-soft text-status-danger-ink",
  },
  high: {
    label: "High",
    dotClass: "bg-status-warn-ink",
    badgeClass: "bg-status-warn-soft text-status-warn-ink",
  },
  medium: {
    label: "Medium",
    dotClass: "bg-accent",
    badgeClass: "bg-well text-ink-secondary",
  },
  low: {
    label: "Low",
    dotClass: "bg-ink-muted",
    badgeClass: "bg-well text-ink-muted",
  },
};
