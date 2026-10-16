import React, { useState } from 'react';
import { X, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ScreenshotTourItem {
  title: string;
  subtitle: string;
  description: string;
  imagePath: string;
}

const TOUR_ITEMS: ScreenshotTourItem[] = [
  {
    title: 'Enterprise Data Grid & Inline Editing',
    subtitle: 'High-density tabular control with double-click inline cell mutation',
    description:
      'Double-click any cell (Title, Status, Priority, Assignee, Due Date, Estimated Hours) to immediately activate an in-place editor. Includes sortable columns, multi-select batch actions, and real-time metric cards.',
    imagePath: '/src/assets/images/dashboard_datagrid_screenshot_1792137344038.jpg',
  },
  {
    title: 'Multi-Lane Kanban Delivery Board',
    subtitle: '5-lane agile delivery pipeline with quick-shift steppers',
    description:
      'Manage tasks across Backlog, To Do, In Progress, In Review, and Completed columns. Double-click titles to edit inline, view checklist completion percentages, and reassign tasks with single clicks.',
    imagePath: '/src/assets/images/kanban_board_screenshot_1792137344818.jpg',
  },
  {
    title: 'Angular Signals Reactive Inspector',
    subtitle: 'Push-pull dependency graphs, dynamic memoization, and telemetry',
    description:
      'Inspect the reactive Signals architecture in real time. Watch fine-grained mutation counters tick up on every edit, examine upstream dependency nodes, and verify glitch-free atomic batching.',
    imagePath: '/src/assets/images/signals_inspector_screenshot_1792137343003.jpg',
  },
];

interface VisualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualTourModal: React.FC<VisualTourModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const current = TOUR_ITEMS[currentIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-700" />
              <span className="text-sm font-bold text-slate-900">TaskMatrix Visual Tour & Screenshots</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {currentIndex + 1} of {TOUR_ITEMS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Screenshot Display */}
          <div className="relative bg-slate-950 p-2 sm:p-4 flex items-center justify-center min-h-[320px] max-h-[500px] overflow-hidden">
            <img
              src={current.imagePath}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="max-h-[460px] w-auto max-w-full object-contain rounded-md shadow-md"
            />
          </div>

          {/* Details & Navigation */}
          <div className="p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <h4 className="text-sm font-bold text-slate-900">{current.title}</h4>
              <p className="text-xs font-medium text-indigo-600">{current.subtitle}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{current.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="p-2 border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous screenshot"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5 px-2">
                {TOUR_ITEMS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Jump to screenshot ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={currentIndex === TOUR_ITEMS.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(TOUR_ITEMS.length - 1, prev + 1))}
                className="p-2 border border-slate-200 rounded-md text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next screenshot"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
