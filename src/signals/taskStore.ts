import { Task, TaskPriority, TaskStatus, Assignee, ActivityEntry, ViewMode, EditableCell } from '../types/task';
import { signal, computed, effect, batch } from './core';

export const ENTERPRISE_ASSIGNEES: Assignee[] = [
  {
    id: 'usr_1',
    name: 'Marcus Vance',
    email: 'marcus.vance@enterprise.io',
    role: 'Lead Cloud Architect',
    department: 'Platform Engineering',
    initials: 'MV',
  },
  {
    id: 'usr_2',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.io',
    role: 'Staff Security Engineer',
    department: 'Security & Governance',
    initials: 'ER',
  },
  {
    id: 'usr_3',
    name: 'David Chen',
    email: 'david.chen@enterprise.io',
    role: 'Senior Full Stack Specialist',
    department: 'Frontend Architecture',
    initials: 'DC',
  },
  {
    id: 'usr_4',
    name: 'Priya Patel',
    email: 'priya.patel@enterprise.io',
    role: 'Staff SRE & Reliability Lead',
    department: 'Infrastructure',
    initials: 'PP',
  },
  {
    id: 'usr_5',
    name: 'Sophia Alvarez',
    email: 'sophia.alvarez@enterprise.io',
    role: 'Principal Systems Strategist',
    department: 'Product Operations',
    initials: 'SA',
  },
];

export const ENTERPRISE_PROJECTS = [
  'Enterprise Cloud Platform',
  'Identity & Access Federation',
  'Core Payments Engine',
  'Observability & Reliability',
  'Security & Compliance',
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-1041',
    title: 'Zero-Trust Service Mesh mTLS Enforcement',
    description: 'Enforce strict mutual TLS authentication between microservices across all staging and production Kubernetes namespaces.',
    status: 'in_progress',
    priority: 'urgent',
    assignee: ENTERPRISE_ASSIGNEES[1], // Elena Rostova
    project: 'Security & Compliance',
    dueDate: '2026-10-22',
    estimatedHours: 24,
    loggedHours: 14,
    tags: ['Security', 'mTLS', 'Kubernetes'],
    subtasks: [
      { id: 'sub_1', title: 'Audit ingress certificates and cipher suites', completed: true },
      { id: 'sub_2', title: 'Deploy sidecar injection policies in staging', completed: true },
      { id: 'sub_3', title: 'Validate egress traffic routing to external APIs', completed: false },
      { id: 'sub_4', title: 'Rotate root authority keys', completed: false },
    ],
    createdAt: '2026-10-10T09:00:00Z',
    updatedAt: '2026-10-15T14:30:00Z',
  },
  {
    id: 'TSK-1042',
    title: 'Multi-Region Cloud Failover Automation',
    description: 'Design automated DNS health probe routing with multi-region Aurora PostgreSQL read-replica promotion scripts.',
    status: 'todo',
    priority: 'high',
    assignee: ENTERPRISE_ASSIGNEES[0], // Marcus Vance
    project: 'Enterprise Cloud Platform',
    dueDate: '2026-10-28',
    estimatedHours: 36,
    loggedHours: 4,
    tags: ['Infrastructure', 'High-Availability', 'DR'],
    subtasks: [
      { id: 'sub_5', title: 'Configure Route53 latency-based routing policies', completed: true },
      { id: 'sub_6', title: 'Test cross-region snapshot replication cadence', completed: false },
      { id: 'sub_7', title: 'Write promotion playbook for secondary cluster', completed: false },
    ],
    createdAt: '2026-10-11T11:20:00Z',
    updatedAt: '2026-10-14T10:15:00Z',
  },
  {
    id: 'TSK-1043',
    title: 'SOC2 Type II Audit Evidence Aggregator',
    description: 'Collect automated evidence exports for identity provider access logs, pull request approvals, and production deployment locks.',
    status: 'in_review',
    priority: 'high',
    assignee: ENTERPRISE_ASSIGNEES[4], // Sophia Alvarez
    project: 'Security & Compliance',
    dueDate: '2026-10-20',
    estimatedHours: 16,
    loggedHours: 16,
    tags: ['Governance', 'SOC2', 'Audit'],
    subtasks: [
      { id: 'sub_8', title: 'Extract Git commit author verification records', completed: true },
      { id: 'sub_9', title: 'Aggregate quarterly user access review certificates', completed: true },
      { id: 'sub_10', title: 'Upload encrypted artifacts to auditor portal', completed: false },
    ],
    createdAt: '2026-10-08T08:00:00Z',
    updatedAt: '2026-10-15T16:45:00Z',
  },
  {
    id: 'TSK-1044',
    title: 'PostgreSQL Read Latency Optimization',
    description: 'Tune query execution plans on the transactional ledger index to reduce 99th percentile query latency below 8ms.',
    status: 'in_progress',
    priority: 'medium',
    assignee: ENTERPRISE_ASSIGNEES[3], // Priya Patel
    project: 'Core Payments Engine',
    dueDate: '2026-10-25',
    estimatedHours: 20,
    loggedHours: 9,
    tags: ['Database', 'Postgres', 'Performance'],
    subtasks: [
      { id: 'sub_11', title: 'Analyze pg_stat_statements slow query logs', completed: true },
      { id: 'sub_12', title: 'Implement composite B-tree indices on merchant_id', completed: false },
      { id: 'sub_13', title: 'Benchmark connection pooler thread limits', completed: false },
    ],
    createdAt: '2026-10-12T13:10:00Z',
    updatedAt: '2026-10-15T11:00:00Z',
  },
  {
    id: 'TSK-1045',
    title: 'Enterprise SAML 2.0 & Okta SCIM Directory Sync',
    description: 'Build enterprise directory sync endpoints handling just-in-time account provisioning and role assignment claims.',
    status: 'done',
    priority: 'high',
    assignee: ENTERPRISE_ASSIGNEES[2], // David Chen
    project: 'Identity & Access Federation',
    dueDate: '2026-10-14',
    estimatedHours: 30,
    loggedHours: 28,
    tags: ['SSO', 'SAML', 'Auth'],
    subtasks: [
      { id: 'sub_14', title: 'Implement SCIM v2 schema handler', completed: true },
      { id: 'sub_15', title: 'Parse XML metadata assertions and certificate checks', completed: true },
      { id: 'sub_16', title: 'Conduct Okta test harness sandbox validation', completed: true },
    ],
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-14T17:30:00Z',
  },
  {
    id: 'TSK-1046',
    title: 'OpenTelemetry Distributed Trace Collector',
    description: 'Standardize trace context propagation across RPC gateways and background message queue consumers.',
    status: 'backlog',
    priority: 'low',
    assignee: ENTERPRISE_ASSIGNEES[3], // Priya Patel
    project: 'Observability & Reliability',
    dueDate: '2026-11-04',
    estimatedHours: 18,
    loggedHours: 0,
    tags: ['Telemetry', 'Tracing', 'DevOps'],
    subtasks: [
      { id: 'sub_17', title: 'Evaluate OTLP gRPC export volume overhead', completed: false },
      { id: 'sub_18', title: 'Add traceparent header injection in HTTP client', completed: false },
    ],
    createdAt: '2026-10-14T15:00:00Z',
    updatedAt: '2026-10-14T15:00:00Z',
  },
  {
    id: 'TSK-1047',
    title: 'Frontend Signals Reactive Store Integration',
    description: 'Refactor enterprise task dashboard to fine-grained push-pull signals architecture for zero-delay inline editing.',
    status: 'done',
    priority: 'urgent',
    assignee: ENTERPRISE_ASSIGNEES[2], // David Chen
    project: 'Enterprise Cloud Platform',
    dueDate: '2026-10-16',
    estimatedHours: 14,
    loggedHours: 14,
    tags: ['Architecture', 'Signals', 'Reactivity'],
    subtasks: [
      { id: 'sub_19', title: 'Implement TC39/Angular push-pull reactive core', completed: true },
      { id: 'sub_20', title: 'Wire double-click cell keyboard listeners', completed: true },
      { id: 'sub_21', title: 'Connect localStorage reactive effect pipeline', completed: true },
    ],
    createdAt: '2026-10-15T08:00:00Z',
    updatedAt: '2026-10-16T00:30:00Z',
  },
  {
    id: 'TSK-1048',
    title: 'Payment Gateway Idempotency Layer',
    description: 'Guarantee exactly-once transaction processing using Redis distributed leases and deterministic payload checksums.',
    status: 'todo',
    priority: 'high',
    assignee: ENTERPRISE_ASSIGNEES[0], // Marcus Vance
    project: 'Core Payments Engine',
    dueDate: '2026-10-27',
    estimatedHours: 22,
    loggedHours: 2,
    tags: ['Payments', 'Distributed', 'Redis'],
    subtasks: [
      { id: 'sub_22', title: 'Implement Redis atomic SETNX lock mechanism', completed: true },
      { id: 'sub_23', title: 'Define replay response cache schema', completed: false },
    ],
    createdAt: '2026-10-13T14:00:00Z',
    updatedAt: '2026-10-15T09:20:00Z',
  },
];

const LOCAL_STORAGE_KEY = 'taskmatrix_enterprise_tasks_v1';

function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse stored tasks, falling back to seed data', e);
  }
  return INITIAL_TASKS;
}

// History stack for Undo / Redo
interface HistorySnapshot {
  tasks: Task[];
  description: string;
}

const historyPast: HistorySnapshot[] = [];
const historyFuture: HistorySnapshot[] = [];

// ==========================================
// REACTIVE SIGNALS
// ==========================================

export const tasksSignal = signal<Task[]>(loadStoredTasks(), { name: 'tasksSignal' });
export const searchQuerySignal = signal<string>('', { name: 'searchQuerySignal' });
export const selectedStatusSignal = signal<TaskStatus | 'all'>('all', { name: 'selectedStatusSignal' });
export const selectedPrioritySignal = signal<TaskPriority | 'all'>('all', { name: 'selectedPrioritySignal' });
export const selectedProjectSignal = signal<string>('all', { name: 'selectedProjectSignal' });
export const selectedAssigneeSignal = signal<string>('all', { name: 'selectedAssigneeSignal' });
export const sortFieldSignal = signal<keyof Task>('updatedAt', { name: 'sortFieldSignal' });
export const sortDirectionSignal = signal<'asc' | 'desc'>('desc', { name: 'sortDirectionSignal' });
export const selectedTaskIdsSignal = signal<Set<string>>(new Set(), { name: 'selectedTaskIdsSignal' });
export const currentViewSignal = signal<ViewMode>('grid', { name: 'currentViewSignal' });
export const editingCellSignal = signal<EditableCell | null>(null, { name: 'editingCellSignal' });
export const activeTaskIdSignal = signal<string | null>(null, { name: 'activeTaskIdSignal' });
export const isNewTaskModalOpenSignal = signal<boolean>(false, { name: 'isNewTaskModalOpenSignal' });
export const isTourOpenSignal = signal<boolean>(false, { name: 'isTourOpenSignal' });
export const canUndoSignal = signal<boolean>(false, { name: 'canUndoSignal' });
export const canRedoSignal = signal<boolean>(false, { name: 'canRedoSignal' });
export const lastSavedTimestampSignal = signal<number>(Date.now(), { name: 'lastSavedTimestampSignal' });

export const activityLogSignal = signal<ActivityEntry[]>([
  {
    id: 'act_1',
    taskId: 'TSK-1047',
    taskTitle: 'Frontend Signals Reactive Store Integration',
    action: 'Completed task verification',
    timestamp: '2026-10-16 00:30',
    user: 'David Chen',
  },
  {
    id: 'act_2',
    taskId: 'TSK-1041',
    taskTitle: 'Zero-Trust Service Mesh mTLS Enforcement',
    action: 'Updated status to In Progress',
    timestamp: '2026-10-15 14:30',
    user: 'Elena Rostova',
  },
], { name: 'activityLogSignal' });

// ==========================================
// REACTIVE EFFECT: PERSISTENCE TO LOCALSTORAGE
// ==========================================
effect(() => {
  const currentTasks = tasksSignal();
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentTasks));
    lastSavedTimestampSignal.set(Date.now());
  } catch (err) {
    console.error('Failed to persist tasks to localStorage:', err);
  }
}, { name: 'localStoragePersistenceEffect' });

// ==========================================
// COMPUTED SIGNALS
// ==========================================

export const filteredTasksSignal = computed(() => {
  const tasks = tasksSignal();
  const search = searchQuerySignal().toLowerCase().trim();
  const status = selectedStatusSignal();
  const priority = selectedPrioritySignal();
  const project = selectedProjectSignal();
  const assignee = selectedAssigneeSignal();
  const sortField = sortFieldSignal();
  const sortDir = sortDirectionSignal();

  return tasks
    .filter((task) => {
      if (status !== 'all' && task.status !== status) return false;
      if (priority !== 'all' && task.priority !== priority) return false;
      if (project !== 'all' && task.project !== project) return false;
      if (assignee !== 'all' && task.assignee.id !== assignee) return false;

      if (search) {
        const matchesTitle = task.title.toLowerCase().includes(search);
        const matchesId = task.id.toLowerCase().includes(search);
        const matchesDesc = task.description.toLowerCase().includes(search);
        const matchesAssignee = task.assignee.name.toLowerCase().includes(search);
        const matchesTags = task.tags.some((t) => t.toLowerCase().includes(search));
        if (!matchesTitle && !matchesId && !matchesDesc && !matchesAssignee && !matchesTags) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const res = valA.localeCompare(valB);
        return sortDir === 'asc' ? res : -res;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
}, { name: 'filteredTasksSignal' });

export const taskMetricsSignal = computed(() => {
  const tasks = tasksSignal();
  const total = tasks.length;
  let inProgress = 0;
  let inReview = 0;
  let completed = 0;
  let overdue = 0;
  let totalEstimated = 0;
  let totalLogged = 0;

  const today = new Date().toISOString().split('T')[0];

  for (const t of tasks) {
    if (t.status === 'in_progress') inProgress++;
    if (t.status === 'in_review') inReview++;
    if (t.status === 'done') completed++;
    if (t.status !== 'done' && t.dueDate < today) overdue++;
    totalEstimated += t.estimatedHours || 0;
    totalLogged += t.loggedHours || 0;
  }

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    inProgress,
    inReview,
    completed,
    overdue,
    totalEstimated,
    totalLogged,
    completionRate,
  };
}, { name: 'taskMetricsSignal' });

export const tasksByStatusSignal = computed(() => {
  const tasks = filteredTasksSignal();
  const groups: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };

  for (const task of tasks) {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  }

  return groups;
}, { name: 'tasksByStatusSignal' });

export const activeTaskDetailsSignal = computed(() => {
  const activeId = activeTaskIdSignal();
  if (!activeId) return null;
  return tasksSignal().find((t) => t.id === activeId) || null;
}, { name: 'activeTaskDetailsSignal' });

// ==========================================
// STORE ACTIONS & MUTATIONS
// ==========================================

function pushHistory(desc: string) {
  historyPast.push({
    tasks: JSON.parse(JSON.stringify(tasksSignal())),
    description: desc,
  });
  if (historyPast.length > 30) {
    historyPast.shift();
  }
  historyFuture.length = 0;
  canUndoSignal.set(historyPast.length > 0);
  canRedoSignal.set(false);
}

export function undo() {
  if (historyPast.length === 0) return;
  const previous = historyPast.pop()!;
  historyFuture.push({
    tasks: JSON.parse(JSON.stringify(tasksSignal())),
    description: 'Redo state',
  });

  tasksSignal.set(previous.tasks);
  canUndoSignal.set(historyPast.length > 0);
  canRedoSignal.set(true);
}

export function redo() {
  if (historyFuture.length === 0) return;
  const next = historyFuture.pop()!;
  historyPast.push({
    tasks: JSON.parse(JSON.stringify(tasksSignal())),
    description: 'Undo state',
  });

  tasksSignal.set(next.tasks);
  canUndoSignal.set(true);
  canRedoSignal.set(historyFuture.length > 0);
}

export function addTask(newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  pushHistory('Add Task');
  const nextNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toISOString();
  const newTask: Task = {
    ...newTaskData,
    id: `TSK-${nextNum}`,
    createdAt: now,
    updatedAt: now,
  };

  batch(() => {
    tasksSignal.update((current) => [newTask, ...current]);
    activityLogSignal.update((log) => [
      {
        id: `act_${Date.now()}`,
        taskId: newTask.id,
        taskTitle: newTask.title,
        action: 'Created task',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Current User',
      },
      ...log.slice(0, 49),
    ]);
  });
}

/**
 * Inline double-click field updater!
 */
export function updateTaskField<K extends keyof Task>(taskId: string, field: K, value: Task[K]) {
  pushHistory(`Update ${String(field)} on ${taskId}`);
  const now = new Date().toISOString();

  batch(() => {
    let taskName = '';
    tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id === taskId) {
          taskName = task.title;
          return {
            ...task,
            [field]: value,
            updatedAt: now,
          };
        }
        return task;
      })
    );

    activityLogSignal.update((log) => [
      {
        id: `act_${Date.now()}`,
        taskId,
        taskTitle: taskName || taskId,
        action: `Updated ${String(field)} via inline edit`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Current User',
      },
      ...log.slice(0, 49),
    ]);

    editingCellSignal.set(null);
  });
}

export function updateTask(taskId: string, updates: Partial<Task>) {
  pushHistory(`Update ${taskId}`);
  const now = new Date().toISOString();

  tasksSignal.update((tasks) =>
    tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          ...updates,
          updatedAt: now,
        };
      }
      return task;
    })
  );
}

export function deleteTask(taskId: string) {
  pushHistory(`Delete ${taskId}`);
  batch(() => {
    tasksSignal.update((tasks) => tasks.filter((t) => t.id !== taskId));
    selectedTaskIdsSignal.update((set) => {
      const next = new Set(set);
      next.delete(taskId);
      return next;
    });
    if (activeTaskIdSignal() === taskId) {
      activeTaskIdSignal.set(null);
    }
  });
}

export function toggleTaskSelection(taskId: string) {
  selectedTaskIdsSignal.update((set) => {
    const next = new Set(set);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    return next;
  });
}

export function selectAllFilteredTasks() {
  const filtered = filteredTasksSignal();
  const currentSet = selectedTaskIdsSignal();
  if (currentSet.size === filtered.length && filtered.length > 0) {
    selectedTaskIdsSignal.set(new Set());
  } else {
    selectedTaskIdsSignal.set(new Set(filtered.map((t) => t.id)));
  }
}

export function clearSelection() {
  selectedTaskIdsSignal.set(new Set());
}

export function bulkUpdateStatus(newStatus: TaskStatus) {
  const selected = selectedTaskIdsSignal();
  if (selected.size === 0) return;

  pushHistory(`Bulk update ${selected.size} tasks to ${newStatus}`);
  const now = new Date().toISOString();

  batch(() => {
    tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (selected.has(task.id)) {
          return {
            ...task,
            status: newStatus,
            updatedAt: now,
          };
        }
        return task;
      })
    );
    clearSelection();
  });
}

export function bulkDelete() {
  const selected = selectedTaskIdsSignal();
  if (selected.size === 0) return;

  pushHistory(`Bulk delete ${selected.size} tasks`);
  batch(() => {
    tasksSignal.update((tasks) => tasks.filter((t) => !selected.has(t.id)));
    clearSelection();
  });
}

export function toggleSubtask(taskId: string, subtaskId: string) {
  tasksSignal.update((tasks) =>
    tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    })
  );
}

export function addSubtask(taskId: string, title: string) {
  if (!title.trim()) return;
  tasksSignal.update((tasks) =>
    tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [
            ...task.subtasks,
            { id: `sub_${Date.now()}`, title: title.trim(), completed: false },
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return task;
    })
  );
}

export function resetToSeedData() {
  pushHistory('Reset to seed data');
  batch(() => {
    tasksSignal.set(INITIAL_TASKS);
    selectedTaskIdsSignal.set(new Set());
    activeTaskIdSignal.set(null);
  });
}

export function exportTasksJSON() {
  const data = JSON.stringify(tasksSignal(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enterprise_tasks_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTasksCSV() {
  const tasks = tasksSignal();
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Project', 'DueDate', 'EstimatedHours', 'LoggedHours'];
  const rows = tasks.map((t) => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    `"${t.assignee.name}"`,
    `"${t.project}"`,
    t.dueDate,
    t.estimatedHours,
    t.loggedHours,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enterprise_tasks_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importTasksJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
      pushHistory('Import JSON');
      tasksSignal.set(parsed);
      return true;
    }
  } catch (e) {
    console.error('Invalid JSON import format:', e);
  }
  return false;
}
