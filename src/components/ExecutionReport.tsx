import React from 'react';
import { useWorkflowStore } from '../store';
import { Activity, Clock, Zap, Database, X, CheckCircle, Shield } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  colorClass?: string;
  bgColorClass?: string;
}

const StatCard = ({ icon, label, value, unit, colorClass = "text-emerald-500", bgColorClass = "bg-slate-900/40 border-slate-800/60" }: StatCardProps) => (
  <div className={`${bgColorClass} border p-4 rounded-2xl transition-all duration-300 hover:border-emerald-500/30`}>
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

export const ExecutionReport: React.FC = () => {
  const { executionReport, setExecutionReport } = useWorkflowStore();

  if (!executionReport || !executionReport.isOpen) return null;

  const closeReport = () => setExecutionReport(null);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300 p-4">
      <div className="w-full max-w-[440px] bg-[#050505] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        
        <button 
          onClick={closeReport}
          className="absolute top-8 right-8 text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/20 rotate-3 transition-transform">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">
            Transmission Summary
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={10} className="text-emerald-500" />
            <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.3em]">Lifecycle Verified</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-10">
          <StatCard icon={<Activity size={14} />} label="Nodes Polled" value={executionReport.nodesExecuted} unit="Units" />
          <StatCard icon={<Database size={14} />} label="Packets Sent" value={executionReport.dataTransferred} unit="PKT" />
          <StatCard icon={<Clock size={14} />} label="Process Time" value={executionReport.timeTaken} unit="Sec" />
          <StatCard icon={<Zap size={14} />} label="Throughput" value={executionReport.avgSpeed} unit="KB/s" />
          
          <div className="col-span-2 mt-1">
            <StatCard 
              icon={<Clock size={14} />} 
              label="Halting Latency" 
              value={executionReport.haltingTime} 
              unit="Sec" 
              colorClass="text-amber-500"
              bgColorClass="bg-amber-500/5 border-amber-500/10"
            />
          </div>
        </div>

        <button 
          onClick={closeReport}
          className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
        >
          Dismiss Protocol
        </button>
      </div>
    </div>
  );
};