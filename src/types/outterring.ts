export type DefaultTaskStatus = "in_progress" | "todo" | "backlog" | "done";
export type TaskStatus = string;
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type WorkspaceTab = "focus" | "board" | "docs";
export type TriageMode = "auto" | "task" | "sprint" | "doc";
export type DocCategory = "architecture" | "runbook" | "meeting" | "ideas" | "general";

export interface KanbanColumn {
  id: string;
  title: string;
  order_idx: number;
  wip_limit?: number | null;
  is_system?: number;
  color?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_minutes: number;
  why_it_matters: string;
  kickstart_action: string;
  kickstart_completed: number;
  sprint_id: string | null;
  order_idx: number;
  created_at: number;
  updated_at: number;
  completed_at: number | null;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  order_idx: number;
}

export interface Sprint {
  id: string;
  title: string;
  goal: string;
  status: "active" | "completed";
  created_at: number;
}

export interface Doc {
  id: string;
  title: string;
  content: string;
  category: DocCategory;
  tags: string; // JSON-encoded string[]
  is_pinned: number;
  created_at: number;
  updated_at: number;
}

export interface DailyMetrics {
  date: string;
  tasks_completed: number;
  focus_minutes: number;
  daily_summary: string;
}

export interface SlicedTask {
  title: string;
  description: string;
  estimatedMinutes: number;
  priority: TaskPriority;
  kickstartAction: string;
  whyItMatters: string;
  subtasks: string[];
}

export interface SlicedSprint {
  title: string;
  goal: string;
  activeSteps: SlicedTask[];
  parkedSteps: SlicedTask[];
}

export interface GroundingAdvice {
  reorientation: string;
  microAction: string;
  suggestedAction: "continue" | "break_smaller" | "switch_task";
}

export interface TriageResult {
  type: "task" | "sprint" | "doc";
  task?: SlicedTask;
  sprint?: SlicedSprint;
  doc?: {
    title: string;
    content: string;
    category: DocCategory;
    tags: string[];
  };
}

export interface WorkspaceSnapshot {
  tasks: Task[];
  subtasks: Subtask[];
  sprints: Sprint[];
  docs: Doc[];
  columns: KanbanColumn[];
  todayMetrics: DailyMetrics;
}
