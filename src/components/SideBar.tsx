import React from 'react';
import { useWorkflowStore } from '../store';
import { Zap, Cpu, PlayCircle, Settings, Clock, Globe, Database, CheckCircle } from 'lucide-react';

interface NodeLibraryItem {
  label: string;
  type: string;
  icon: React.ReactNode;
  color: string;
  inputsCount?: number;
  outputsCount?: number;
  params?: Record<string, any>;
}

export const Sidebar: React.FC = () => {
  const { addNode, viewport } = useWorkflowStore();

  const nodeLibrary: NodeLibraryItem[] = [
    { label: 'Start Trigger', type: 'trigger', icon: <Zap size={14}/>, color: 'cyan' },
    { label: 'Webhook', type: 'trigger', icon: <Globe size={14}/>, color: 'cyan' },
    { label: 'AND Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 2, outputsCount: 1, params: { gateType: 'AND', a: false, b: false } },
    { label: 'OR Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 2, outputsCount: 1, params: { gateType: 'OR', a: false, b: false } },
    { label: 'XOR Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 2, outputsCount: 2, params: { gateType: 'XOR', a: false, b: false } },
    { label: 'NOT Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 1, outputsCount: 1, params: { gateType: 'NOT', input: false } },
    { label: 'NAND Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 2, outputsCount: 1, params: { gateType: 'NAND', a: false, b: false } },
    { label: 'NOR Gate', type: 'logic', icon: <Cpu size={14}/>, color: 'purple', inputsCount: 2, outputsCount: 1, params: { gateType: 'NOR', a: false, b: false } },
    { label: 'Time Delay', type: 'logic', icon: <Clock size={14}/>, color: 'purple' },
    { label: 'API Action', type: 'action', icon: <PlayCircle size={14}/>, color: 'emerald' },
    { label: 'DB Query', type: 'action', icon: <Database size={14}/>, color: 'emerald' },
    { label: 'Utility Box', type: 'utility', icon: <Settings size={14}/>, color: 'slate' },
    { type: 'action', label: 'Finish Node', icon: <CheckCircle size={14} />, color: 'emerald', inputsCount: 1, outputsCount: 0 }
  ];

  const handleCreateNode = (item: NodeLibraryItem) => {
    const id = `${item.type}-${Date.now()}`;
    const inputsCount = item.inputsCount ?? (item.type === 'trigger' ? 0 : 1);
    const outputsCount = item.outputsCount ?? 1;

    addNode({
      id, type: item.type,
      position: { x: (window.innerWidth / 2 - viewport.x - 300) / viewport.zoom, y: (window.innerHeight / 2 - viewport.y - 60) / viewport.zoom },
      data: { label: item.label, status: 'IDLE', params: item.params ? { ...item.params } : {} },
      width: 180, height: 120,
      inputs: Array.from({ length: inputsCount }, (_, idx) => ({ id: `${id}-in-${idx + 1}`, type: 'input' as const })),
      outputs: Array.from({ length: outputsCount }, (_, idx) => ({ id: `${id}-out-${idx + 1}`, type: 'output' as const })),
    });
  };

  return (
    <aside className="w-64 h-full border-r border-slate-800 bg-[#0f172a] flex flex-col z-10 overflow-hidden">
      <div className="px-6 py-6 border-b border-slate-800/50">
        <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Component Library</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
        {nodeLibrary.map((item, i) => (
          <button key={i} onClick={() => handleCreateNode(item)} className="group w-full flex items-center gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all active:scale-95 text-left relative overflow-hidden">
            <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-all`}>
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{item.type}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};