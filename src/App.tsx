import React, { useState, useEffect, useRef } from 'react';
import { useWorkflowStore } from './store';
import { InteractionLayer } from './components/InteractionLayer';
import { Properties } from './components/Properties';
import { Sidebar } from './components/SideBar';
import { StatusBar } from './components/StatusBar';
import { ExecutionReport } from './components/ExecutionReport';
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";
import { 
  Undo, Redo, Grid, ZoomIn, ZoomOut, 
  Play, Pause, StepForward, Plus, Layout, Download, Upload, Save 
} from 'lucide-react';

export default function App() {
  const { 
    currentUser, isHydrated, saveProject, undo, redo, 
    createNewGraph, toggleGrid, executeGraph, zoomIn, 
    zoomOut, exportJSON, importJSON, setMousePosition,
    pauseSimulation, resumeSimulation, stepSimulation,
    isSimulationRunning, isSimulationPaused
  } = useWorkflowStore();

  const [view, setView] = useState<"dashboard" | "builder">("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [setMousePosition]);

  if (!isHydrated) return null;

  // Handlers for Navigation
  const handleOpenProject = () => setView("builder");
  const handleNewProject = () => setView("builder");

  const BuilderUI = (
    <div className="flex flex-col h-screen w-screen bg-[#020617] text-slate-300 overflow-hidden select-none font-sans">
      <header className="h-14 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layout size={18} className="text-blue-500" />
            <span className="font-black text-white text-[10px] uppercase tracking-[0.3em] italic">CYBERFLOW V1</span>
          </div>
          
          <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
            <button onClick={() => setView("dashboard")} className="px-4 py-1.5 text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all rounded-lg hover:bg-white/5">Dashboard</button>
            <button className="px-4 py-1.5 text-[9px] font-black text-blue-500 bg-blue-500/10 uppercase tracking-widest rounded-lg">Editor</button>
          </nav>

          <div className="h-4 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-1">
            <button onClick={undo} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Undo size={14}/></button>
            <button onClick={redo} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Redo size={14}/></button>
            <button onClick={toggleGrid} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"><Grid size={14}/></button>
            <div className="flex items-center gap-1 ml-2 bg-white/5 rounded-lg p-1">
              <button onClick={zoomOut} className="p-1 hover:text-white transition-colors"><ZoomOut size={13}/></button>
              <button onClick={zoomIn} className="p-1 hover:text-white transition-colors"><ZoomIn size={13}/></button>
            </div>
          </div>
        </div>

        


        <div className="flex items-center gap-4">
  <button onClick={createNewGraph} className="flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
    <Plus size={14} /> New Node
  </button>

  {/* Only Adding Icons here - calling store functions directly */}
  <div className="flex items-center gap-1 mr-2">
    <button 
      onClick={exportJSON}
      className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
    >
      <Download size={16} />
    </button>
    
    <button 
      onClick={() => fileInputRef.current?.click()}
      className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
    >
      <Upload size={16} />
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (f) => importJSON(f.target?.result as string);
            reader.readAsText(file);
          }
        }}
      />
    </button>
  </div>

  <button 
    onClick={() => {
      const name = prompt("Project Name:", "My Workflow");
      if (name) saveProject(name);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-500 hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
  >
    <Save size={14} /> Save to Dashboard
  </button>

  {!isSimulationRunning ? (
    <button onClick={executeGraph} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20">
      <Play size={12} fill="currentColor" /> Initialize Simulation
    </button>
  ) : (
    <div className="flex items-center gap-2">
      {isSimulationPaused ? (
        <button onClick={resumeSimulation} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
          <Play size={12} fill="currentColor" /> Resume
        </button>
      ) : (
        <button onClick={pauseSimulation} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
          <Pause size={12} /> Pause
        </button>
      )}

      <button onClick={stepSimulation} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
        <StepForward size={12} /> Step
      </button>
    </div>
  )}
</div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="relative flex-1 bg-[#020617]"><InteractionLayer /></main>
        <Properties />
        <ExecutionReport />
      </div>
      <StatusBar />
    </div>
  );

  return (
    <div className="w-screen min-h-screen bg-[#020617] overflow-hidden relative">
      {!currentUser ? <AuthModal onClose={() => {}} /> : (
        <div className="w-full h-full">
          {view === "dashboard" ? (
            <Dashboard onOpenProject={handleOpenProject} onNewProject={handleNewProject} />
          ) : BuilderUI}
        </div>
      )}
    </div>
  );
}