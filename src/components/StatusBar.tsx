import React from 'react';
import { useWorkflowStore } from '../store';

export const StatusBar: React.FC = () => {
  const { nodes, edges, viewport, selectedNodeId } = useWorkflowStore();

  return (
    <footer className="h-8 border-t border-neutral-800 bg-black flex items-center justify-between px-6 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
      <div className="flex gap-6">
        <span>Zoom: {Math.round(viewport.zoom * 100)}% </span>
        <span>Cursor: {Math.round(viewport.x)}, {Math.round(viewport.y)}</span>
      </div>
      
      <div className="flex gap-6">
        <span>Selected Nodes: {selectedNodeId ? '1' : '0'}</span>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${nodes.length > 0 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
           <span>Graph Status: {nodes.length > 0 ? 'Valid' : 'Empty'}</span>
        </div>
      </div>

      <div className="flex gap-6">
        <span className="text-cyan-500">Active Tool: Draw</span>
        <span className="text-neutral-400">Sync Status: Saved</span>
      </div>
    </footer>
  );
};