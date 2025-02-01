export enum ProjectStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SubtaskStatus {
  task: string;
  completed: boolean;
  assignee?: string;
  completedAt?: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: Priority;
  status: ProjectStatus;
  subtasks: string[] | SubtaskStatus[];
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string[];
  dependencies?: string[];
  tags?: string[];
}

export interface ProjectProgress {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  blocked: number;
  completionPercentage: number;
}

export interface ChecklistFilter {
  category?: string;
  priority?: Priority;
  status?: ProjectStatus;
  assignee?: string;
  tags?: string[];
}