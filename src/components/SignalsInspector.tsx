import React, { useState, useEffect } from 'react';
import { signalRegistry, subscribeRegistry, SignalNodeInfo, batch } from '../signals/core';
import { tasksSignal, searchQuerySignal, updateTaskField, lastSavedTimestampSignal } from '../signals/taskStore';
import { Activity, Zap, CheckCircle2, RefreshCw, Cpu, GitBranch, ArrowRight, Layers } from 'lucide-react';

export const SignalsInspector: React.FC = () => {
  const [nodes, setNodes] = useState<SignalNodeInfo[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'writable' | 'computed' | 'effect'>('all');
  const [selectedNode, setSelectedNode] = useState<SignalNodeInfo | null>(null);

  useEffect(() => {
    const update = () => {
      const allNodes = Array.from(signalRegistry.values());
      setNodes(allNodes);
      if (selectedNode) {
        const refreshed = allNodes.find((n) => n.id === selectedNode.id);
        if (refreshed) setSelectedNode(refreshed);
      }
    };
    update();
    return subscribeRegistry(update);
  }, [selectedNode]);

  const filteredNodes = nodes.filter((n) => filterType === 'all' || n.type === filterType);
  const totalMutations = nodes.reduce((sum, n) => sum + n.mutationCount, 0);

  const handleTestBatch = () => {
    // Demonstrate batching
    batch(() => {
      const current = tasksSignal();
      if (current.length > 0) {
        updateTaskField(current[0].id, 'estimatedHours', current[0].estimatedHours + 1);
      }
      searchQuerySignal.set('');
    });
  };

  return (
    <div className="space-y-5">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Reactivity Cycle</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {nodes.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Registered Reactive Nodes
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Fine-Grained Updates</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalMutations}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Total Signal Mutations Recorded
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Glitch-Free Memoization</span>
            <GitBranch className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {nodes.filter((n) => n.type === 'computed').length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Dynamic Computed Signals
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Persistence Pipeline</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            Active
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Reactive localStorage Auto-Sync
          </div>
        </div>
      </div>

      {/* Main Architecture Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Signal Nodes Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Reactive Graph Telemetry</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({filteredNodes.length} nodes)
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded text-xs">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'all' ? 'bg-white font-medium text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('writable')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'writable' ? 'bg-white font-medium text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Writable
              </button>
              <button
                type="button"
                onClick={() => setFilterType('computed')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'computed' ? 'bg-white font-medium text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Computed
              </button>
              <button
                type="button"
                onClick={() => setFilterType('effect')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  filterType === 'effect' ? 'bg-white font-medium text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Effects
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Node Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Mutations</th>
                  <th className="py-2.5 px-3 text-right">Deps</th>
                  <th className="py-2.5 px-3 text-right">Subscribers</th>
                  <th className="py-2.5 px-3">Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <tr
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 text-slate-900 font-sans font-medium">
                        {node.name}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
                            node.type === 'writable'
                              ? 'bg-blue-50 text-blue-700'
                              : node.type === 'computed'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {node.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-700">
                        {node.mutationCount}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                        {node.dependenciesCount}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                        {node.dependentsCount}
                      </td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-[140px] text-[11px]">
                        {String(node.currentValueSnapshot)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Architecture Inspector & Node Details */}
        <div className="space-y-4">
          {/* Selected Node Inspector */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Node Inspector</span>
            </h4>

            {selectedNode ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Identifier:</span>
                  <div className="font-mono text-slate-800 font-semibold">{selectedNode.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[11px]">Type:</span>
                    <div className="font-medium text-slate-700 capitalize">{selectedNode.type}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Mutations:</span>
                    <div className="font-mono tabular-nums text-slate-700">{selectedNode.mutationCount}</div>
                  </div>
                </div>

                {selectedNode.dependencies.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[11px]">Upstream Dependencies:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedNode.dependencies.map((d) => (
                        <li key={d} className="flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[11px]">Current Value Representation:</span>
                  <div className="mt-1 p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700 break-all">
                    {JSON.stringify(selectedNode.currentValueSnapshot)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Click any reactive node on the table to inspect its graph linkages and current snapshot.
              </p>
            )}
          </div>

          {/* Interactive Batch Sandbox */}
          <div className="bg-slate-900 text-white p-4 rounded-lg shadow-sm">
            <h4 className="text-xs font-bold mb-1.5 flex items-center gap-1.5 text-slate-100">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Angular Signals Batching</span>
            </h4>
            <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
              Angular & TC39 Signals use push-pull dirty marking: updates mark dependents as dirty, while actual evaluation happens lazily on demand.
            </p>
            <button
              type="button"
              onClick={handleTestBatch}
              className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Trigger Atomic Batch Update</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
