import React, { useState, useEffect, useRef } from 'react';
import { useSignal } from '../signals/core';
import {
  filteredTasksSignal,
  selectedTaskIdsSignal,
  editingCellSignal,
  activeTaskIdSignal,
  sortFieldSignal,
  sortDirectionSignal,
  toggleTaskSelection,
  selectAllFilteredTasks,
  updateTaskField,
  deleteTask,
  isNewTaskModalOpenSignal,
  ENTERPRISE_ASSIGNEES,
  ENTERPRISE_PROJECTS,
} from '../signals/taskStore';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Edit2,
} from 'lucide-react';

export const DataGrid: React.FC = () => {
  const tasks = useSignal(filteredTasksSignal);
  const selectedIds = useSignal(selectedTaskIdsSignal);
  const editingCell = useSignal(editingCellSignal);
  const sortField = useSignal(sortFieldSignal);
  const sortDir = useSignal(sortDirectionSignal);

  // Temporary edit value while inline editing
  const [editValue, setEditValue] = useState<string>('');
  const [recentlyEditedId, setRecentlyEditedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  const isAllSelected = tasks.length > 0 && selectedIds.size === tasks.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < tasks.length;

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && typeof inputRef.current.select === 'function') {
        inputRef.current.select();
      }
    }
  }, [editingCell]);

  const handleStartEdit = (taskId: string, field: 'title' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'estimatedHours' | 'project', currentVal: unknown) => {
    if (field === 'assignee') {
      setEditValue((currentVal as { id: string })?.id || '');
    } else {
      setEditValue(String(currentVal ?? ''));
    }
    editingCellSignal.set({ taskId, field });
  };

  const handleCommitEdit = () => {
    if (!editingCell) return;
    const { taskId, field } = editingCell;

    let parsedVal: unknown = editValue;
    if (field === 'estimatedHours') {
      parsedVal = Math.max(0, parseFloat(editValue) || 0);
    } else if (field === 'assignee') {
      const found = ENTERPRISE_ASSIGNEES.find((a) => a.id === editValue);
      if (found) {
        parsedVal = found;
      } else {
        editingCellSignal.set(null);
        return;
      }
    }

    updateTaskField(taskId, field as keyof Task, parsedVal as Task[keyof Task]);
    setRecentlyEditedId(`${taskId}_${field}`);
    setTimeout(() => setRecentlyEditedId(null), 1000);
  };

  const handleCancelEdit = () => {
    editingCellSignal.set(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      sortDirectionSignal.set(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      sortFieldSignal.set(field);
      sortDirectionSignal.set('asc');
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-xs font-semibold text-rose-700">Urgent</span>;
      case 'high':
        return <span className="text-xs font-medium text-amber-700">High</span>;
      case 'medium':
        return <span className="text-xs font-medium text-blue-700">Medium</span>;
      case 'low':
      default:
        return <span className="text-xs font-normal text-slate-500">Low</span>;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'backlog':
        return <span className="text-xs text-slate-500">Backlog</span>;
      case 'todo':
        return <span className="text-xs font-medium text-slate-700">To Do</span>;
      case 'in_progress':
        return <span className="text-xs font-medium text-blue-700">In Progress</span>;
      case 'in_review':
        return <span className="text-xs font-medium text-amber-700">In Review</span>;
      case 'done':
        return <span className="text-xs font-semibold text-emerald-700">Completed</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Table Helper Banner */}
      <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Double-click any cell (Title, Status, Priority, Assignee, Due Date, Hours) to edit inline. Press Enter to save, Esc to cancel.</span>
        </div>
        <span className="font-mono tabular-nums text-slate-600 font-medium">
          {tasks.length} {tasks.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold select-none">
              {/* Checkbox select */}
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={selectAllFilteredTasks}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-850"
                  aria-label="Select all tasks"
                />
              </th>

              {/* ID Column */}
              <th
                onClick={() => handleSort('id')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors w-24"
              >
                <div className="flex items-center gap-1">
                  <span>Task ID</span>
                  {sortField === 'id' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Title & Project Column */}
              <th
                onClick={() => handleSort('title')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors min-w-[280px]"
              >
                <div className="flex items-center gap-1">
                  <span>Task Title & Domain</span>
                  {sortField === 'title' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Status Column */}
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  {sortField === 'status' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Priority Column */}
              <th
                onClick={() => handleSort('priority')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors w-24"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  {sortField === 'priority' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Assignee Column */}
              <th className="py-2.5 px-3 w-40">
                <span>Assignee</span>
              </th>

              {/* Due Date Column */}
              <th
                onClick={() => handleSort('dueDate')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors w-28 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Due Date</span>
                  {sortField === 'dueDate' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Hours Column */}
              <th
                onClick={() => handleSort('estimatedHours')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100/70 transition-colors w-28 text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Hours</span>
                  {sortField === 'estimatedHours' ? (
                    sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              </th>

              {/* Progress Column */}
              <th className="py-2.5 px-3 w-28">
                <span>Subtasks</span>
              </th>

              {/* Actions Column */}
              <th className="py-2.5 px-3 w-16 text-center">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No tasks match current filters</p>
                    <p className="text-xs text-slate-400">Clear filters or create a new enterprise task.</p>
                    <button
                      type="button"
                      onClick={() => isNewTaskModalOpenSignal.set(true)}
                      className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Create Task
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isSelected = selectedIds.has(task.id);
                const isOverdue = task.status !== 'done' && task.dueDate < new Date().toISOString().split('T')[0];
                const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
                const totalSubtasks = task.subtasks.length;
                const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                return (
                  <tr
                    key={task.id}
                    className={`group transition-colors h-11 ${
                      isSelected ? 'bg-slate-100/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-800"
                        aria-label={`Select ${task.id}`}
                      />
                    </td>

                    {/* ID */}
                    <td className="py-2 px-3 font-mono text-slate-500 tabular-nums">
                      <button
                        type="button"
                        onClick={() => activeTaskIdSignal.set(task.id)}
                        className="hover:underline text-slate-700 font-semibold"
                        title="Open task details drawer"
                      >
                        {task.id}
                      </button>
                    </td>

                    {/* Title & Project (Inline Editable) */}
                    <td
                      className={`py-2 px-3 relative cursor-text group-cell ${
                        recentlyEditedId === `${task.id}_title` ? 'bg-emerald-50' : ''
                      }`}
                      onDoubleClick={() => handleStartEdit(task.id, 'title', task.title)}
                      title="Double-click to edit task title"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'title' ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCommitEdit}
                            onKeyDown={handleKeyDown}
                            className="w-full py-1 px-2 text-xs font-semibold text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1 flex items-center gap-1.5">
                            <span>{task.title}</span>
                            <span className="opacity-0 group-hover:opacity-60 transition-opacity">
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <span>{task.project}</span>
                            {task.tags.length > 0 && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{task.tags.join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status (Inline Editable) */}
                    <td
                      className={`py-2 px-3 cursor-pointer ${
                        recentlyEditedId === `${task.id}_status` ? 'bg-emerald-50' : ''
                      }`}
                      onDoubleClick={() => handleStartEdit(task.id, 'status', task.status)}
                      title="Double-click to change status"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'status' ? (
                        <select
                          ref={inputRef as React.RefObject<HTMLSelectElement>}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="py-1 px-1.5 text-xs text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="in_review">In Review</option>
                          <option value="done">Completed</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1">
                          {getStatusLabel(task.status)}
                        </div>
                      )}
                    </td>

                    {/* Priority (Inline Editable) */}
                    <td
                      className={`py-2 px-3 cursor-pointer ${
                        recentlyEditedId === `${task.id}_priority` ? 'bg-emerald-50' : ''
                      }`}
                      onDoubleClick={() => handleStartEdit(task.id, 'priority', task.priority)}
                      title="Double-click to change priority"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'priority' ? (
                        <select
                          ref={inputRef as React.RefObject<HTMLSelectElement>}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="py-1 px-1.5 text-xs text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      ) : (
                        <div>{getPriorityBadge(task.priority)}</div>
                      )}
                    </td>

                    {/* Assignee (Inline Editable) */}
                    <td
                      className={`py-2 px-3 cursor-pointer ${
                        recentlyEditedId === `${task.id}_assignee` ? 'bg-emerald-50' : ''
                      }`}
                      onDoubleClick={() => handleStartEdit(task.id, 'assignee', task.assignee)}
                      title="Double-click to reassign"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'assignee' ? (
                        <select
                          ref={inputRef as React.RefObject<HTMLSelectElement>}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="py-1 px-1 text-xs text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                        >
                          {ENTERPRISE_ASSIGNEES.map((usr) => (
                            <option key={usr.id} value={usr.id}>
                              {usr.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-mono text-[10px] font-semibold shrink-0">
                            {task.assignee.initials}
                          </span>
                          <span className="text-slate-700 truncate">{task.assignee.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Due Date (Inline Editable) */}
                    <td
                      className={`py-2 px-3 text-right cursor-pointer font-mono tabular-nums ${
                        isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'
                      } ${recentlyEditedId === `${task.id}_dueDate` ? 'bg-emerald-50' : ''}`}
                      onDoubleClick={() => handleStartEdit(task.id, 'dueDate', task.dueDate)}
                      title="Double-click to change due date"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'dueDate' ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="py-0.5 px-1 text-xs text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                        />
                      ) : (
                        <span>{task.dueDate}</span>
                      )}
                    </td>

                    {/* Hours (Inline Editable) */}
                    <td
                      className={`py-2 px-3 text-right cursor-pointer font-mono tabular-nums text-slate-600 ${
                        recentlyEditedId === `${task.id}_estimatedHours` ? 'bg-emerald-50' : ''
                      }`}
                      onDoubleClick={() => handleStartEdit(task.id, 'estimatedHours', task.estimatedHours)}
                      title="Double-click to update estimated hours"
                    >
                      {editingCell?.taskId === task.id && editingCell?.field === 'estimatedHours' ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          type="number"
                          min="0"
                          step="0.5"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleCommitEdit}
                          onKeyDown={handleKeyDown}
                          className="w-16 py-0.5 px-1 text-xs text-right text-slate-900 bg-white border border-slate-800 rounded focus:outline-none"
                        />
                      ) : (
                        <span>{task.estimatedHours}h</span>
                      )}
                    </td>

                    {/* Progress Subtasks */}
                    <td className="py-2 px-3">
                      {totalSubtasks > 0 ? (
                        <div className="w-full">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums mb-1">
                            <span>{completedSubtasks}/{totalSubtasks}</span>
                            <span>{subtaskPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                subtaskPercentage === 100 ? 'bg-emerald-600' : 'bg-slate-700'
                              }`}
                              style={{ width: `${subtaskPercentage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No subtasks</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => activeTaskIdSignal.set(task.id)}
                          title="View task details"
                          className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete task ${task.id}?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          title="Delete task"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
