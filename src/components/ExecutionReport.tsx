import React from 'react';
import { useWorkflowStore } from '../store';
import { Activity, Clock, Zap, Database, X, CheckCircle } from 'lucide-react';

export const ExecutionReport: React.FC = () => {
  const { executionReport, setExecutionReport } = useWorkflowStore();

  // Only render if the report state is active
  if (!executionReport || !executionReport.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[440px] bg-[#0f172a] border border-emerald-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
        
        {/* Background Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px]" />
        
        <button 
          onClick={() => setExecutionReport(null)}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Execution Summary</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Transmission lifecycle complete</p>
        </div>

        {/* Metric Grid - Updated to include Halting Time */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={<Activity size={14} />} label="Nodes Processed" value={executionReport.nodesExecuted} unit="Units" />
          <StatCard icon={<Database size={14} />} label="Payload Size" value={executionReport.dataTransferred} unit="KB" />
          <StatCard icon={<Clock size={14} />} label="Total Time" value={executionReport.timeTaken} unit="Sec" />
          <StatCard icon={<Zap size={14} />} label="Throughput" value={executionReport.avgSpeed} unit="KB/s" />
          
          {/* New Halting Time Stat */}
          <div className="col-span-2">
            <StatCard 
              icon={<Clock size={14} />} 
              label="Time Halting (Total Delay)" 
              value={executionReport.haltingTime} 
              unit="Sec" 
              colorClass="text-amber-500"
              bgColorClass="bg-amber-500/5 border-amber-500/20"
            />
          </div>
        </div>

        <button 
          onClick={() => setExecutionReport(null)}
          className="w-full py-4 bg-emerald-600 text-[#020617] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/40"
        >
          Dismiss Report
        </button>
      </div>
    </div>
  );
};

// Interface for props to make TypeScript happy
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  colorClass?: string;
  bgColorClass?: string;
}

const StatCard = ({ icon, label, value, unit, colorClass = "text-emerald-500", bgColorClass = "bg-slate-900/40 border-slate-800/60" }: StatCardProps) => (
  <div className={`${bgColorClass} border p-4 rounded-2xl transition-colors`}>
    <div className="flex items-center gap-2 text-slate-500 mb-2">
      <span className={colorClass}>{icon}</span>
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{unit}</span>
    </div>
  </div>
);