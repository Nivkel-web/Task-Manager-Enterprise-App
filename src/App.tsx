import React, { useEffect } from 'react';
import { useSignal } from './signals/core';
import {
  currentViewSignal,
  undo,
  redo,
  canUndoSignal,
  canRedoSignal,
  isNewTaskModalOpenSignal,
  searchQuerySignal,
} from './signals/taskStore';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { DataGrid } from './components/DataGrid';
import { KanbanBoard } from './components/KanbanBoard';
import { TimelineView } from './components/TimelineView';
import { SignalsInspector } from './components/SignalsInspector';
import { TaskDetailsDrawer } from './components/TaskDetailsDrawer';
import { NewTaskModal } from './components/NewTaskModal';
import { ChevronRight, Cpu } from 'lucide-react';

export default function App() {
  const currentView = useSignal(currentViewSignal);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z (without shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Cmd+Shift+Z or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }
      // New Task: Alt+N or Cmd+J
      if ((e.altKey && e.key.toLowerCase() === 'n') || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        isNewTaskModalOpenSignal.set(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract (Wordmark - Navigation - Primary Action) */}
      <Header />

      {/* Main Workspace Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        {/* Workspace Breadcrumbs & Subtitle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Enterprise Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">Core Engineering</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">Q4 Sprint Deliverables</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Angular Signals Reactive Engine</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Persistent Local Cache</span>
          </div>
        </div>

        {/* High-Density KPI Metric Strip */}
        <MetricCards />

        {/* Search, Filter & Segmented Toolbar */}
        <FilterBar />

        {/* View Switcher Output */}
        <div className="mt-2">
          {currentView === 'grid' && <DataGrid />}
          {currentView === 'kanban' && <KanbanBoard />}
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'signals' && <SignalsInspector />}
        </div>
      </main>

      {/* Slide-over Task Details Drawer */}
      <TaskDetailsDrawer />

      {/* Create Task Modal */}
      <NewTaskModal />

      {/* Minimal Enterprise Footer (Clean unboxed metadata) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TaskMatrix Enterprise</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Signals State Store v1.4</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Double-Click Inline Editing Active</span>
          </div>
          <div className="flex items-center gap-3 font-mono tabular-nums text-[11px] text-slate-400">
            <span>Shortcuts: Ctrl+Z (Undo) · Ctrl+Y (Redo) · Double-Click (Inline Edit)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
