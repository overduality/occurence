import type {
  KanbanColumn,
  Sprint,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/outterring";

export interface KanbanBoardProps {
  tasks: Task[];
  subtasks: Subtask[];
  sprints: Sprint[];
  columns?: KanbanColumn[];
  activeSprint: Sprint | null;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onCreateTask: (payload: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimated_minutes: number;
    kickstart_action: string;
    status: TaskStatus;
    sprint_id?: string | null;
  }) => void;
  onInspectTask: (task: Task) => void;
  onSliceTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
  onCreateSprint: (
    title: string,
    goal: string,
    moveUnfinishedTasks?: boolean
  ) => Promise<string | null>;
  onUpdateSprint: (
    sprintId: string,
    patch: {
      title?: string;
      goal?: string;
      status?: "active" | "completed";
      parkUnfinished?: boolean;
      pullUnfinishedTasks?: boolean;
      assignTaskIds?: string[];
    }
  ) => Promise<void>;
  onCreateColumn?: (title: string, wip_limit?: number | null, color?: string) => Promise<void>;
  onUpdateColumn?: (columnId: string, patch: Partial<KanbanColumn>) => Promise<void>;
  onDeleteColumn?: (columnId: string) => Promise<void>;
  onReorderColumns?: (reordered: KanbanColumn[]) => Promise<void>;
  onSwitchToFocusHUD: () => void;
  onOpenGuide?: () => void;
}
