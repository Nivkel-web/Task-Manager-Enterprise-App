import React, { useState } from 'react';
import { useSignal } from '../signals/core';
import {
  activeTaskDetailsSignal,
  activeTaskIdSignal,
  updateTask,
  deleteTask,
  toggleSubtask,
  addSubtask,
  activityLogSignal,
  ENTERPRISE_ASSIGNEES,
  ENTERPRISE_PROJECTS,
} from '../signals/taskStore';
import { TaskPriority, TaskStatus } from '../types/task';
import {
  X,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Calendar,
  User,
  FolderGit2,
  Tag,
  AlertTriangle,
  History,
  CheckCircle2,
} from 'lucide-react';

export const TaskDetailsDrawer: React.FC = () => {
  const task = useSignal(activeTaskDetailsSignal);
  const activityLog = useSignal(activityLogSignal);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  if (!task) return null;

  const handleClose = () => {
    activeTaskIdSignal.set(null);
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const taskActivities = activityLog.filter((a) => a.taskId === task.id);
  const completedSubs = task.subtasks.filter((s) => s.completed).length;
  const totalSubs = task.subtasks.length;
  const percentSubs = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-xl flex flex-col border-l border-slate-200">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {task.id}
              </span>
              <span className="text-xs text-slate-500 font-medium">Enterprise Task</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete ${task.id}?`)) {
                    deleteTask(task.id);
                  }
                }}
                title="Delete task"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Title */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Task Title</label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="mt-1 w-full text-base font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none transition-colors px-0 py-1"
              />
            </div>

            {/* Status & Priority Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1">Status</span>
                <select
                  value={task.status}
                  onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 font-medium block mb-1">Priority</span>
                <select
                  value={task.priority}
                  onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskPriority })}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Properties Matrix */}
            <div className="space-y-3 text-xs">
              {/* Assignee */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assignee</span>
                </span>
                <select
                  value={task.assignee.id}
                  onChange={(e) => {
                    const found = ENTERPRISE_ASSIGNEES.find((a) => a.id === e.target.value);
                    if (found) updateTask(task.id, { assignee: found });
                  }}
                  className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer"
                >
                  {ENTERPRISE_ASSIGNEES.map((usr) => (
                    <option key={usr.id} value={usr.id}>
                      {usr.name} ({usr.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Project */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project</span>
                </span>
                <select
                  value={task.project}
                  onChange={(e) => updateTask(task.id, { project: e.target.value })}
                  className="text-xs font-medium text-slate-800 bg-transparent border-0 focus:ring-0 cursor-pointer"
                >
                  {ENTERPRISE_PROJECTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due Date</span>
                </span>
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                  className="text-xs font-mono tabular-nums text-slate-800 bg-transparent border-0 focus:ring-0"
                />
              </div>

              {/* Hours */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Logged / Estimated Hours</span>
                </span>
                <div className="flex items-center gap-1 font-mono tabular-nums">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={task.loggedHours}
                    onChange={(e) => updateTask(task.id, { loggedHours: parseFloat(e.target.value) || 0 })}
                    className="w-12 text-xs text-right border border-slate-200 rounded px-1 py-0.5"
                  />
                  <span>h /</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={task.estimatedHours}
                    onChange={(e) => updateTask(task.id, { estimatedHours: parseFloat(e.target.value) || 0 })}
                    className="w-12 text-xs text-right border border-slate-200 rounded px-1 py-0.5"
                  />
                  <span>h</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Description & Acceptance Criteria</label>
              </div>
              <textarea
                rows={3}
                value={task.description}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                className="w-full text-xs text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 leading-relaxed"
                placeholder="Add architectural notes, acceptance specs, or reproduction steps..."
              />
            </div>

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">Checklist & Subtasks</span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {completedSubs}/{totalSubs} ({percentSubs}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-slate-900 transition-all"
                  style={{ width: `${percentSubs}%` }}
                />
              </div>

              <div className="space-y-1.5 mb-3">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer text-xs transition-colors"
                  >
                    {st.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSub} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a checklist step..."
                  className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Activity History */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Audit & Modification History</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200 max-h-40 overflow-y-auto">
                {taskActivities.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">No recent modifications recorded.</div>
                ) : (
                  taskActivities.map((act) => (
                    <div key={act.id} className="text-[11px] flex justify-between">
                      <span className="text-slate-700">{act.action}</span>
                      <span className="font-mono tabular-nums text-slate-400">{act.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
