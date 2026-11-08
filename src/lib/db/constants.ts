import type { KanbanColumn } from "@/types/outterring";

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: "in_progress", title: "In Progress", order_idx: 0, wip_limit: 1, is_system: 1, color: "accent" },
  { id: "todo", title: "To Do", order_idx: 1, wip_limit: null, is_system: 1, color: "muted" },
  { id: "done", title: "Done", order_idx: 2, wip_limit: null, is_system: 1, color: "success" },
  { id: "backlog", title: "Backlog", order_idx: 3, wip_limit: null, is_system: 0, color: "warn" },
];
