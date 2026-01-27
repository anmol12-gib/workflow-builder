import React from 'react';
import { useWorkflowStore } from '../store';
import { Node as NodeType, Position, Viewport } from '../types';

interface NodeProps {
  node: NodeType;
  viewport: Viewport; 
  onPortMouseDown: (id: string, type: 'input' | 'output', pos: Position) => void;
}

export const Node: React.FC<NodeProps> = ({ node, onPortMouseDown }) => {
  const { setSelectedNode, selectedNodeId } = useWorkflowStore();
  const isSelected = selectedNodeId === node.id;
  
  const isFinishNode = node.data.label === 'Finish Node';
  const status = node.data.status || 'IDLE';
  const isError = status === 'Error';

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); }}
      className={`relative bg-[#0f172a]/95 backdrop-blur-md border rounded-2xl transition-all duration-200 overflow-hidden ${
        node.data.disabled 
          ? 'opacity-40 grayscale pointer-events-none' 
          : isError
            ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]' 
            : isSelected 
              ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.2)]' 
              : isFinishNode 
                ? 'border-emerald-500/40 shadow-xl' 
                : 'border-slate-800/80 shadow-xl'
      }`}
      style={{ width: 180, height: 120 }}
    >
      {/* 1. NODE NAME */}
      <div className={`px-4 py-3 border-b border-slate-800/50 flex justify-between items-center rounded-t-2xl ${
        isError ? 'bg-red-500/10' : isFinishNode ? 'bg-emerald-500/5' : 'bg-slate-900/40'
      }`}>
        <span className={`text-[10px] font-black uppercase tracking-widest truncate ${
          isError ? 'text-red-400' : isFinishNode ? 'text-emerald-400' : 'text-slate-400'
        }`}>
          {node.data.label}
        </span>
      </div>

      {/* 2. NODE STATUS */}
      <div className="p-4 flex flex-col items-center justify-center h-[calc(100%-42px)]">
        <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${
          isError ? 'bg-red-500/20 text-red-400' : 
          status === 'Complete' ? 'bg-emerald-500/20 text-emerald-400' :
          status === 'Processing' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
          'bg-slate-950/50 text-slate-600'
        }`}>
          {status}
        </div>
      </div>

      {/* Input Ports */}
      <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-center gap-3">
        {node.inputs.map(p => (
          <div 
            key={p.id} 
            data-port-id={p.id} 
            data-port-type="input"
            className="w-4 h-4 bg-[#020617] border border-slate-700 rounded-full hover:bg-cyan-500 hover:border-cyan-400 cursor-crosshair transition-all pointer-events-auto group relative" 
            onMouseDown={(e) => { 
              e.stopPropagation(); 
              onPortMouseDown(p.id, 'input', { x: node.position.x, y: node.position.y + 60 }); 
            }} 
          >
            <span className="absolute left-6 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-[8px] px-2 py-1 rounded border border-slate-700 text-slate-400 uppercase">Input</span>
          </div>
        ))}
      </div>

      {/* Output Ports - HIDDEN FOR FINISH NODE */}
      <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-center gap-3">
        {!isFinishNode && node.outputs.map(p => (
          <div 
            key={p.id} 
            data-port-id={p.id} 
            data-port-type="output"
            className="w-4 h-4 bg-[#020617] border border-slate-700 rounded-full hover:bg-cyan-500 hover:border-cyan-400 cursor-crosshair transition-all pointer-events-auto group relative" 
            onMouseDown={(e) => { 
              e.stopPropagation(); 
              onPortMouseDown(p.id, 'output', { x: node.position.x + 180, y: node.position.y + 60 }); 
            }} 
          >
            <span className="absolute right-6 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-[8px] px-2 py-1 rounded border border-slate-700 text-slate-400 uppercase">Output</span>
          </div>
        ))}
      </div>
    </div>
  );
};
