import React from 'react';
import { useSignal } from '../signals/core';
import { taskMetricsSignal, selectedStatusSignal } from '../signals/taskStore';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

export const MetricCards: React.FC = () => {
  const metrics = useSignal(taskMetricsSignal);
  const selectedStatus = useSignal(selectedStatusSignal);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {/* Metric 1: Total Tasks */}
      <div
        onClick={() => selectedStatusSignal.set('all')}
        className={`cursor-pointer bg-white p-4 rounded-lg border transition-all ${
          selectedStatus === 'all'
            ? 'border-slate-800 ring-1 ring-slate-800/10 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Total Backlog & Active</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {metrics.total}
          </span>
          <span className="text-xs text-slate-500">tasks</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="font-mono tabular-nums">{metrics.totalEstimated}h est</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-mono tabular-nums">{metrics.totalLogged}h logged</span>
        </div>
      </div>

      {/* Metric 2: In Progress */}
      <div
        onClick={() => selectedStatusSignal.set('in_progress')}
        className={`cursor-pointer bg-white p-4 rounded-lg border transition-all ${
          selectedStatus === 'in_progress'
            ? 'border-blue-600 ring-1 ring-blue-600/10 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">In Active Sprints</span>
          <Clock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-blue-900 font-mono tabular-nums">
            {metrics.inProgress}
          </span>
          <span className="text-xs text-blue-700 font-medium">in progress</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Active engineering load</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Click to filter</span>
        </div>
      </div>

      {/* Metric 3: Under Review */}
      <div
        onClick={() => selectedStatusSignal.set('in_review')}
        className={`cursor-pointer bg-white p-4 rounded-lg border transition-all ${
          selectedStatus === 'in_review'
            ? 'border-amber-600 ring-1 ring-amber-600/10 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Audit & Peer Review</span>
          <span className="text-xs font-semibold text-amber-700">PRs</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-900 font-mono tabular-nums">
            {metrics.inReview}
          </span>
          <span className="text-xs text-amber-700 font-medium">pending signoff</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span>Security / Architecture review</span>
        </div>
      </div>

      {/* Metric 4: Completed & Velocity */}
      <div
        onClick={() => selectedStatusSignal.set('done')}
        className={`cursor-pointer bg-white p-4 rounded-lg border transition-all ${
          selectedStatus === 'done'
            ? 'border-emerald-600 ring-1 ring-emerald-600/10 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Sprint Completion</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {metrics.completionRate}%
          </span>
          <span className="text-xs text-emerald-700 font-medium font-mono tabular-nums">
            ({metrics.completed}/{metrics.total})
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {metrics.overdue > 0 ? (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{metrics.overdue}</span> overdue
            </span>
          ) : (
            <span className="text-emerald-700 font-medium">On scheduled track</span>
          )}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-slate-500">Enterprise SLA</span>
        </div>
      </div>
    </div>
  );
};
