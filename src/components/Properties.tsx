import React, { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store';
import { Fingerprint, Trash2, Ban } from 'lucide-react';

export const Properties: React.FC = () => {
  const { nodes, selectedNodeId, updateNodeData, removeNode } = useWorkflowStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  
  const [jsonValue, setJsonValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Sync local state with selected node
  useEffect(() => {
    if (selectedNode) {
      
      const currentParams = selectedNode.data.params;
      const hasParams = currentParams && Object.keys(currentParams).length > 0;
      setJsonValue(hasParams ? JSON.stringify(currentParams, null, 2) : '');
      setIsValid(true);
    }
  }, [selectedNodeId]);

  if (!selectedNode) return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] p-6 text-slate-500 italic text-[10px] uppercase tracking-widest">
      Select a node to view properties
    </aside>
  );

  const handleJsonChange = (val: string) => {
    setJsonValue(val);
    if (val.trim() === '') {
      setIsValid(true);
      updateNodeData(selectedNode.id, { params: {} });
      return;
    }
    try {
      const parsed = JSON.parse(val);
      setIsValid(true);
      updateNodeData(selectedNode.id, { params: parsed });
    } catch (e) {
      setIsValid(false);
    }
  };

  return (
    <aside className="w-80 border-l border-slate-800 bg-[#0f172a] flex flex-col h-full overflow-hidden">
      {/* 1. Header Section (Static) */}
      <div className="p-6 pb-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-6">Node Settings</h2>
      </div>

      {/* 2. Scrollable Content (Nodes, Ports, JSON) */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6 custom-scrollbar pb-4">
        {/* UNIQUE IDENTIFIER */}
        <div>
          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Unique Identifier</label>
          <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-400">
            <Fingerprint size={14} className="text-cyan-500" />
            <span className="text-[10px] font-mono truncate">{selectedNode.id}</span>
          </div>
        </div>

        {/* NODE NAME */}
        <div>
          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Node Name</label>
          <input 
            value={selectedNode.data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* INPUTS / OUTPUTS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Inputs</div>
            <div className="text-lg font-black text-cyan-400">{selectedNode.inputs.length}</div>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Outputs</div>
            <div className="text-lg font-black text-purple-400">{selectedNode.outputs.length}</div>
          </div>
        </div>

        {/* NODE PARAMETERS (JSON) */}
        <div>
          <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Node Parameters (JSON)
          </label>
          <textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder='{"key": "value"}'
            className={`w-full h-32 bg-slate-950 font-mono text-[10px] p-4 rounded-xl border transition-all outline-none resize-none placeholder:text-slate-700 ${
              isValid ? 'border-slate-800 focus:border-cyan-500/50' : 'border-red-500/50 bg-red-500/5'
            }`}
          />
          {!isValid && <p className="text-[7px] text-red-500 mt-2 font-black uppercase">Invalid JSON</p>}
        </div>
      </div>

      {/* 3. Footer Actions (Locked In-Frame) */}
      <div className="p-6 pt-4 border-t border-slate-800 bg-[#0f172a] space-y-3 mt-auto">
        <button 
          onClick={() => updateNodeData(selectedNode.id, { disabled: !selectedNode.data.disabled })}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
            selectedNode.data.disabled 
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
          }`}
        >
          <Ban size={12} /> {selectedNode.data.disabled ? 'Enable Component' : 'Disable Component'}
        </button>

        <button 
          onClick={() => {
            if(window.confirm("Destroy this node?")) removeNode(selectedNode.id);
          }}
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/5 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg"
        >
          <Trash2 size={12} /> Destroy Node
        </button>
      </div>
    </aside>
  );
};
