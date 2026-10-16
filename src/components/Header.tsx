import React from 'react';
import { ViewMode } from '../types/task';
import { useSignal } from '../signals/core';
import {
  currentViewSignal,
  isNewTaskModalOpenSignal,
  canUndoSignal,
  canRedoSignal,
  undo,
  redo,
  lastSavedTimestampSignal,
} from '../signals/taskStore';
import { Plus, RotateCcw, RotateCw, Activity, LayoutGrid, Kanban, CalendarRange } from 'lucide-react';

export const Header: React.FC = () => {
  const currentView = useSignal(currentViewSignal);
  const canUndo = useSignal(canUndoSignal);
  const canRedo = useSignal(canRedoSignal);
  const lastSaved = useSignal(lastSavedTimestampSignal);

  const formattedSavedTime = new Date(lastSaved).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Strict Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (Primary Action) */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              currentViewSignal.set('grid');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
          >
            TaskMatrix Enterprise
          </a>
          <span className="hidden sm:inline text-xs text-slate-400 font-normal">
            Signals Engine
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => currentViewSignal.set('grid')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              currentView === 'grid'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-slate-500" />
            <span>Data Grid</span>
          </button>

          <button
            type="button"
            onClick={() => currentViewSignal.set('kanban')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              currentView === 'kanban'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4 text-slate-500" />
            <span>Kanban Board</span>
          </button>

          <button
            type="button"
            onClick={() => currentViewSignal.set('timeline')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              currentView === 'timeline'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-4 h-4 text-slate-500" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => currentViewSignal.set('signals')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
              currentView === 'signals'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Signals Inspector</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + Undo/Redo & Auto-save status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-1 text-xs text-slate-400 mr-2">
            <span>Storage:</span>
            <span className="font-mono tabular-nums text-slate-600">{formattedSavedTime}</span>
          </div>

          <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => isNewTaskModalOpenSignal.set(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
