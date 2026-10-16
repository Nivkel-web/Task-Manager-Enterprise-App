import React from 'react';
import { useSignal } from '../signals/core';
import { filteredTasksSignal, activeTaskIdSignal } from '../signals/taskStore';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { Calendar, ChevronRight } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const tasks = useSignal(filteredTasksSignal);

  // Derive timeline date range (e.g. October 2026 window)
  const timelineDays = Array.from({ length: 28 }, (_, i) => {
    const day = i + 8; // Oct 8 to Nov 4
    return {
      dayNum: day > 31 ? day - 31 : day,
      month: day > 31 ? 'Nov' : 'Oct',
      dateStr: `2026-${day > 31 ? '11-0' : '10-'}${String(day > 31 ? day - 31 : day).padStart(2, '0')}`,
    };
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500';
      case 'high':
        return 'bg-amber-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-800">Q4 Sprint Delivery Schedule</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">October - November 2026</span>
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
            <span>Medium</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          {/* Days Grid Header */}
          <div className="grid grid-cols-[280px_1fr] border-b border-slate-200 bg-slate-50 text-xs">
            <div className="p-2.5 font-semibold text-slate-700 border-r border-slate-200">
              Task & Domain
            </div>
            <div className="grid grid-cols-28 divide-x divide-slate-100 text-center font-mono tabular-nums text-[11px] text-slate-500">
              {timelineDays.map((d) => (
                <div key={d.dateStr} className={`py-1.5 ${d.dateStr === '2026-10-16' ? 'bg-indigo-50/80 font-bold text-indigo-700' : ''}`}>
                  <div className="text-[9px] text-slate-400">{d.month}</div>
                  <div>{d.dayNum}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              // Calculate span start and end relative to Oct 8 (start of our 28-day window)
              const taskCreated = task.createdAt.slice(0, 10);
              const taskDue = task.dueDate;

              // Compute column offset (0 to 27)
              const startDayOffset = Math.max(0, Math.min(27, Math.floor((new Date(taskCreated).getTime() - new Date('2026-10-08').getTime()) / (1000 * 60 * 60 * 24))));
              const dueDayOffset = Math.max(startDayOffset + 1, Math.min(27, Math.floor((new Date(taskDue).getTime() - new Date('2026-10-08').getTime()) / (1000 * 60 * 60 * 24))));
              const spanDays = Math.max(1, dueDayOffset - startDayOffset + 1);

              const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
              const totalSubtasks = task.subtasks.length;
              const percent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : (task.status === 'done' ? 100 : task.status === 'in_progress' ? 40 : 10);

              return (
                <div key={task.id} className="grid grid-cols-[280px_1fr] hover:bg-slate-50/60 transition-colors h-11 items-center">
                  {/* Left Label */}
                  <div className="px-3 border-r border-slate-100 truncate flex items-center justify-between">
                    <div className="truncate">
                      <button
                        type="button"
                        onClick={() => activeTaskIdSignal.set(task.id)}
                        className="font-mono text-xs text-slate-700 hover:text-slate-900 font-semibold mr-1.5"
                      >
                        {task.id}
                      </button>
                      <span className="text-xs text-slate-800 font-medium truncate" title={task.title}>
                        {task.title}
                      </span>
                    </div>
                  </div>

                  {/* Right Timeline Grid Area */}
                  <div className="relative h-full grid grid-cols-28 divide-x divide-slate-50 items-center px-1">
                    {/* Today indicator vertical line */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-indigo-400 z-10 pointer-events-none"
                      style={{ left: `${(8 / 28) * 100}%` }}
                    />

                    {/* Schedule Bar */}
                    <div
                      onClick={() => activeTaskIdSignal.set(task.id)}
                      className="absolute h-6 rounded cursor-pointer transition-all hover:ring-1 hover:ring-slate-800 shadow-2xs overflow-hidden flex items-center px-2 text-[10px] font-medium text-white"
                      style={{
                        left: `${(startDayOffset / 28) * 100}%`,
                        width: `${(spanDays / 28) * 100}%`,
                      }}
                      title={`${task.title} (${task.status}) - ${task.dueDate}`}
                    >
                      {/* Bar Background Color */}
                      <div className={`absolute inset-0 ${getPriorityColor(task.priority)} opacity-90`} />

                      {/* Completed Progress Overlay */}
                      <div
                        className="absolute inset-y-0 left-0 bg-slate-950/25"
                        style={{ width: `${percent}%` }}
                      />

                      {/* Bar Text */}
                      <span className="relative z-10 truncate font-mono text-[10px] drop-shadow-xs">
                        {task.estimatedHours}h · {percent}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
