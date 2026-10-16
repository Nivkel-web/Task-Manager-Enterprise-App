import React, { useRef } from 'react';
import { useSignal } from '../signals/core';
import {
  searchQuerySignal,
  selectedStatusSignal,
  selectedPrioritySignal,
  selectedProjectSignal,
  selectedAssigneeSignal,
  selectedTaskIdsSignal,
  currentViewSignal,
  ENTERPRISE_ASSIGNEES,
  ENTERPRISE_PROJECTS,
  bulkUpdateStatus,
  bulkDelete,
  clearSelection,
  exportTasksCSV,
  exportTasksJSON,
  importTasksJSON,
  resetToSeedData,
} from '../signals/taskStore';
import { TaskPriority, TaskStatus, ViewMode } from '../types/task';
import {
  Search,
  X,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  PlayCircle,
  LayoutGrid,
  Kanban,
  CalendarRange,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';

export const FilterBar: React.FC = () => {
  const searchQuery = useSignal(searchQuerySignal);
  const selectedStatus = useSignal(selectedStatusSignal);
  const selectedPriority = useSignal(selectedPrioritySignal);
  const selectedProject = useSignal(selectedProjectSignal);
  const selectedAssignee = useSignal(selectedAssigneeSignal);
  const selectedIds = useSignal(selectedTaskIdsSignal);
  const currentView = useSignal(currentViewSignal);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSelected = selectedIds.size > 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = importTasksJSON(text);
        if (ok) {
          alert('Tasks imported successfully from JSON backup.');
        } else {
          alert('Failed to parse tasks JSON. Ensure schema matches TaskMatrix format.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Primary Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        {/* Left: Search & Filter inputs */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => searchQuerySignal.set(e.target.value)}
              placeholder="Filter tasks, ID, tags, or assignees..."
              className="w-full pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => searchQuerySignal.set('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project dropdown */}
          <select
            value={selectedProject}
            onChange={(e) => selectedProjectSignal.set(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">All Projects</option>
            {ENTERPRISE_PROJECTS.map((proj) => (
              <option key={proj} value={proj}>
                {proj}
              </option>
            ))}
          </select>

          {/* Priority dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => selectedPrioritySignal.set(e.target.value as TaskPriority | 'all')}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee dropdown */}
          <select
            value={selectedAssignee}
            onChange={(e) => selectedAssigneeSignal.set(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">All Assignees</option>
            {ENTERPRISE_ASSIGNEES.map((usr) => (
              <option key={usr.id} value={usr.id}>
                {usr.name} ({usr.department.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Clear filters shortcut */}
          {(searchQuery || selectedProject !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                searchQuerySignal.set('');
                selectedProjectSignal.set('all');
                selectedPrioritySignal.set('all');
                selectedAssigneeSignal.set('all');
                selectedStatusSignal.set('all');
              }}
              className="px-2 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Right: View Toggles & Data Management Tools */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200/80">
            <button
              type="button"
              onClick={() => currentViewSignal.set('grid')}
              title="Table Grid View"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                currentView === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => currentViewSignal.set('kanban')}
              title="Kanban Board View"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                currentView === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => currentViewSignal.set('timeline')}
              title="Timeline Schedule"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                currentView === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => currentViewSignal.set('signals')}
              title="Angular Signals Telemetry & Inspector"
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                currentView === 'signals'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Signals</span>
            </button>
          </div>

          {/* Export / Import tools */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={exportTasksCSV}
              title="Export tasks to CSV"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Import tasks JSON"
              className="cursor-pointer p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset tasks to default enterprise seed dataset? Any custom edits will be replaced.')) {
                  resetToSeedData();
                }
              }}
              title="Reset to enterprise seed data"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar (Conditionally active when items are selected) */}
      {hasSelected && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-mono tabular-nums">
              {selectedIds.size}
            </span>
            <span>tasks selected</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-slate-400 hover:text-white underline underline-offset-2"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => bulkUpdateStatus('done')}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
            <button
              type="button"
              onClick={() => bulkUpdateStatus('in_progress')}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded font-medium transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Set In Progress</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.size} selected tasks permanently?`)) {
                  bulkDelete();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
