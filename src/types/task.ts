export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  initials: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: Assignee;
  project: string;
  dueDate: string; // YYYY-MM-DD
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  action: string;
  timestamp: string;
  user: string;
}

export type ViewMode = 'grid' | 'kanban' | 'timeline' | 'signals';

export interface EditableCell {
  taskId: string;
  field: 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'estimatedHours' | 'project';
}
