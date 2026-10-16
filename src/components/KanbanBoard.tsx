import React, { useState } from 'react';
import { useSignal } from '../signals/core';
import {
  tasksByStatusSignal,
  activeTaskIdSignal,
  updateTaskField,
  deleteTask,
  isNewTaskModalOpenSignal,
  ENTERPRISE_ASSIGNEES,
} from '../signals/taskStore';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Edit2,
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; description: string }[] = [
  { id: 'backlog', label: 'Backlog', description: 'Groomed requests & architecture RFCs' },
  { id: 'todo', label: 'To Do', description: 'Sprint committed deliverables' },
  { id: 'in_progress', label: 'In Progress', description: 'Active engineering implementation' },
  { id: 'in_review', label: 'In Review', description: 'Code review, mTLS & audit validation' },
  { id: 'done', label: 'Completed', description: 'Verified and deployed to production' },
];

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  backlog: 'todo',
  todo: 'in_progress',
  in_progress: 'in_review',
  in_review: 'done',
  done: null,
};

const PREV_STATUS: Record<TaskStatus, TaskStatus | null> = {
  backlog: null,
  todo: 'backlog',
  in_progress: 'todo',
  in_review: 'in_progress',
  done: 'in_review',
};

export const KanbanBoard: React.FC = () => {
  const groupedTasks = useSignal(tasksByStatusSignal);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');

  const handleStartTitleEdit = (task: Task) => {
    setEditingTitleId(task.id);
    setTempTitle(task.title);
  };

  const handleSaveTitle = (taskId: string) => {
    if (tempTitle.trim()) {
      updateTaskField(taskId, 'title', tempTitle.trim());
    }
    setEditingTitleId(null);
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[11px] font-semibold text-rose-700">Urgent</span>;
      case 'high':
        return <span className="text-[11px] font-medium text-amber-700">High</span>;
      case 'medium':
        return <span className="text-[11px] font-medium text-blue-700">Medium</span>;
      case 'low':
      default:
        return <span className="text-[11px] font-normal text-slate-500">Low</span>;
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1100px]">
        {COLUMNS.map((col) => {
          const colTasks = groupedTasks[col.id] || [];
          const totalHours = colTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0);

          return (
            <div
              key={col.id}
              className="flex-1 flex flex-col bg-slate-100/70 rounded-lg border border-slate-200/90 p-3 min-w-[260px] max-w-[340px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800">{col.label}</h3>
                  <span className="text-xs font-mono tabular-nums text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {totalHours}h
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-2.5 min-h-[300px]">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-md text-slate-400 text-xs">
                    <span>No tasks in this lane</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isOverdue = task.status !== 'done' && task.dueDate < new Date().toISOString().split('T')[0];
                    const completedSubs = task.subtasks.filter((s) => s.completed).length;
                    const isEditing = editingTitleId === task.id;

                    return (
                      <div
                        key={task.id}
                        className="bg-white p-3 rounded-md border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all group"
                      >
                        {/* Card Header: ID & Priority */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <button
                            type="button"
                            onClick={() => activeTaskIdSignal.set(task.id)}
                            className="font-mono text-slate-500 hover:text-slate-900 font-semibold"
                          >
                            {task.id}
                          </button>
                          <div className="flex items-center gap-1.5">
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>

                        {/* Title (Inline double-click editable) */}
                        {isEditing ? (
                          <div className="my-1.5">
                            <input
                              type="text"
                              value={tempTitle}
                              autoFocus
                              onChange={(e) => setTempTitle(e.target.value)}
                              onBlur={() => handleSaveTitle(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(task.id);
                                if (e.key === 'Escape') setEditingTitleId(null);
                              }}
                              className="w-full text-xs font-semibold text-slate-900 border border-slate-800 rounded px-1.5 py-1 focus:outline-none"
                            />
                            <div className="text-[10px] text-slate-400 mt-0.5">Press Enter to save</div>
                          </div>
                        ) : (
                          <h4
                            onDoubleClick={() => handleStartTitleEdit(task)}
                            className="text-xs font-semibold text-slate-900 line-clamp-2 cursor-pointer hover:text-slate-700 my-1"
                            title="Double-click to edit title"
                          >
                            {task.title}
                          </h4>
                        )}

                        {/* Domain kicker */}
                        <div className="text-[11px] text-slate-500 mb-2 truncate">
                          {task.project}
                        </div>

                        {/* Card Footer: Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[9px] font-semibold">
                              {task.assignee.initials}
                            </span>
                            <span className="truncate max-w-[85px]">{task.assignee.name.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`font-mono tabular-nums ${isOverdue ? 'text-rose-600 font-medium' : ''}`}>
                              {task.dueDate.slice(5)}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="font-mono tabular-nums">{task.estimatedHours}h</span>
                          </div>
                        </div>

                        {/* Quick Lane Shift Controls */}
                        <div className="mt-2 pt-1 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={!PREV_STATUS[task.status]}
                            onClick={() => {
                              const prev = PREV_STATUS[task.status];
                              if (prev) updateTaskField(task.id, 'status', prev);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            title="Move to previous column"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => activeTaskIdSignal.set(task.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-700 underline underline-offset-2"
                          >
                            Details
                          </button>

                          <button
                            type="button"
                            disabled={!NEXT_STATUS[task.status]}
                            onClick={() => {
                              const next = NEXT_STATUS[task.status];
                              if (next) updateTaskField(task.id, 'status', next);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                            title="Advance to next column"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Add CTA at bottom of lane */}
              <button
                type="button"
                onClick={() => isNewTaskModalOpenSignal.set(true)}
                className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white rounded border border-dashed border-slate-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task to {col.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
