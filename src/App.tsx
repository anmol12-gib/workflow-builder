import React from 'react';
import { useWorkflowStore } from './store';
import { InteractionLayer } from './components/InteractionLayer';
import { Properties } from './components/Properties';
import { Sidebar } from './components/SideBar';
import { StatusBar } from './components/StatusBar';
import { ExecutionReport } from './components/ExecutionReport';
import { 
  Play, Undo, Redo, Maximize, Grid, Hash, 
  FilePlus, ZoomIn, ZoomOut, Clock 
} from 'lucide-react';

export default function App() {
  const { 
    nodes, undo, redo, createNewGraph, toggleGrid, 
    toggleSnap, gridEnabled, snapToGrid, exportJSON, 
    executeGraph, setViewport, setSelectedNode, zoomIn, zoomOut,
    isHalting, haltingTime, simulationSpeed, setSimulationSpeed, importJSON
  } = useWorkflowStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fitToScreen = () => {
    if (nodes.length === 0) return setViewport({ x: 0, y: 0, zoom: 1 });
    
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + 180));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + 120));

    setViewport({ 
      x: (window.innerWidth / 2) - ((minX + maxX) / 2), 
      y: (window.innerHeight / 2) - ((minY + maxY) / 2), 
      zoom: 1 
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importJSON(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f172a] text-slate-300 overflow-hidden select-none font-sans">
      {/* Header Section */}
      <header className="h-14 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center">
          <span className="font-bold text-cyan-500 text-xs uppercase tracking-widest mr-6">Cyberflow v1</span>
          
          <div className="flex items-center border-l border-slate-800 ml-4 pl-4 gap-1">
            <button onClick={createNewGraph} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <FilePlus size={16}/>
            </button>
            
            <div className="h-4 w-[1px] bg-slate-800 mx-2" />
            
            <button onClick={zoomOut} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <ZoomOut size={16}/>
            </button>
            <button onClick={fitToScreen} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <Maximize size={16}/>
            </button>
            <button onClick={zoomIn} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <ZoomIn size={16}/>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-2" />

            <button onClick={undo} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <Undo size={16}/>
            </button>
            <button onClick={redo} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <Redo size={16}/>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-2" />

            <button 
              onClick={toggleGrid} 
              className={`p-2 rounded-lg transition-all ${gridEnabled ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <Grid size={16}/>
            </button>
            <button 
              onClick={toggleSnap} 
              className={`p-2 rounded-lg transition-all ${snapToGrid ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <Hash size={16}/>
            </button>
          </div>

          {/* HALTING TIMER INTEGRATION */}
          {isHalting && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full animate-pulse ml-6">
              <Clock size={12} className="text-amber-500" />
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                System Halting: {haltingTime.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-3 border-l border-slate-800 ml-4 pl-4 pr-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Speed: {simulationSpeed}x</span>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.5" 
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          
          <div className="flex items-center gap-2 border-l border-slate-800 ml-4 pl-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange} 
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Import
            </button>

            <span className="text-slate-700 text-[10px] font-bold">/</span>

            <button 
              onClick={exportJSON} 
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
            >
              Export
            </button>

            <button onClick={executeGraph} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] ml-4" > 
              <Play size={12} fill="currentColor"/> Run Logic 
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          className="relative flex-1 bg-[#020617] overflow-hidden" 
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedNode(null);
          }}
        >
          <InteractionLayer />
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-800 animate-pulse">
                System Ready / Deploy Nodes
              </p>
            </div>
          )}
        </main>
        <Properties />
        <ExecutionReport />
      </div>

      <StatusBar />
    </div>
  );

}
