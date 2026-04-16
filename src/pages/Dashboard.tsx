import { useEffect, useState } from "react";
import { useDashboardStore } from "../dashboardStore";
import { useWorkflowStore } from "../store";
import { 
  FilePlus, User, Layers, ArrowUpRight, Github, 
  Linkedin, Mail, Globe, Shield, Cpu, Zap, Network 
} from "lucide-react"; 
import ProfilePanel from "../components/ProfilePanel";

export default function Dashboard({ onOpenProject, onNewProject }: any) {
  const { projects, loadProjects, deleteProject } = useDashboardStore();
  const { currentUser } = useWorkflowStore();

  const [showProfile, setShowProfile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadProjects();
    setTimeout(() => setLoaded(true), 100);
  }, [loadProjects]);

  // 🔥 CURSOR GLOW ENGINE
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.getElementsByClassName("glow-card");
      for (const card of cards as any) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#030303] text-slate-200 selection:bg-blue-500/30 font-sans">
      
      {/* 🔥 DYNAMIC BACKGROUND MESH */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000_60%,transparent_100%)]
          bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
          bg-[size:40px_40px]" />
      </div>

      {/* 🔥 STICKY NAVIGATION */}
      <nav className="sticky top-0 z-50 px-8 py-4 border-b border-white/[0.05] backdrop-blur-2xl bg-black/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Cyberflow V1</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNewProject}
              className="relative group px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest text-white
              bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <FilePlus size={14} /> New Workflow
              </span>
            </button>

            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20">
        
        {/* HERO SECTION */}
        <div className="max-w-4xl mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              Visual Logic Engine v2.4
          </div>
          
          <h2 className={`text-7xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white
            transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            Orchestrate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-500 to-slate-800 italic">your Workflows.</span>
          </h2>
          
          <p className="text-slate-500 text-xl font-medium max-w-xl leading-relaxed">
            {currentUser?.displayName ? `Ready, ${currentUser.displayName}. ` : ""}
            The command center is fully operational. Build and deploy node-based logic with zero latency and industrial precision.
          </p>
        </div>

        {/* WORKFLOWS GRID */}
        <div className="mb-40">
          <div className="flex items-center gap-4 mb-12">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Active Projects</h3>
            <div className="h-[1px] flex-grow bg-white/[0.05]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <div
                key={p.id}
                onClick={() => onOpenProject(p.id)}
                className="glow-card group relative flex flex-col rounded-[2.5rem] bg-[#0A0A0A] border border-white/[0.05] overflow-hidden cursor-pointer
                  transition-all duration-500 hover:-translate-y-2 hover:border-white/[0.15] active:scale-[0.98]
                  before:absolute before:inset-0 before:opacity-0 before:hover:opacity-100 before:transition-opacity
                  before:bg-[radial-gradient(800px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(59,130,246,0.06),transparent_40%)]"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this workflow?")) deleteProject(p.id);
                  }}
                  className="absolute top-6 right-6 z-30 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all backdrop-blur-md uppercase tracking-tighter"
                >
                  Terminate
                </button>

                <div className="h-56 bg-[#050505] relative overflow-hidden p-3">
                  <div className="w-full h-full rounded-2xl overflow-hidden relative border border-white/[0.03]">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    ) : (
                      <div className="w-full h-full bg-[#080808] flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(59,130,246,0.03),transparent)] h-1/2 w-full animate-[scan_3s_linear_infinite]" />
                        <Layers size={32} className="text-slate-800" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 pt-2 flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase italic">
                      {p.name || "Untitled"}
                    </h3>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nodes: {p.nodeCount || 0}</span>
                      <span className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-xl">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 ARCHITECTURE SECTION */}
        <section className="mb-40 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h4 className="text-4xl font-black text-white tracking-tighter leading-none italic uppercase">
              The Architecture <br /> of <span className="text-blue-500">Flow.</span>
            </h4>
            <div className="space-y-6 text-slate-500 font-medium text-lg leading-relaxed">
              <p>
                Cyberflow operates on a high-concurrency event loop, allowing you to bridge the gap between abstract logic and functional deployment.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <TheoryItem 
                  icon={<Cpu size={18}/>} 
                  title="Low-Latency Engine" 
                  desc="Synchronized state updates across all connected nodes in under 12ms." 
                />
                <TheoryItem 
                  icon={<Zap size={18}/>} 
                  title="Reactive Prototyping" 
                  desc="Modify logic in real-time without interrupting the primary data stream." 
                />
                <TheoryItem 
                  icon={<Network size={18}/>} 
                  title="Neural Mapping" 
                  desc="Visual representations of complex dependency trees and recursive loops." 
                />
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="aspect-square bg-[#080808] border border-white/[0.05] rounded-[3rem] flex items-center justify-center overflow-hidden">
               <div className="relative w-48 h-48 border-2 border-dashed border-white/10 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                  <div className="w-32 h-32 border border-blue-500/30 rounded-full animate-[ping_4s_ease-in-out_infinite]" />
                  <Network size={40} className="text-blue-500 absolute" />
               </div>
            </div>
          </div>
        </section>

      </main>

      {/* 🔥 ULTRA CONTACT FOOTER */}
      <footer className="relative z-10 bg-[#050505] border-t border-white/[0.05] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                   <Layers size={20} className="text-blue-500" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Cyberflow</span>
              </div>
              <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                Pushing the boundaries of visual programming and workflow automation. Built for the next generation of engineers.
              </p>
            </div>
            
            {/* CHANNELS SECTION */}
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Communication</h4>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="mailto:anmol.virmani.ug23@nsut.ac.in" 
                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-medium text-sm group"
                  >
                    <Mail size={16} className="text-blue-500 group-hover:scale-110 transition-transform" /> 
                    anmol.virmani.ug23@nsut.ac.in
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer font-medium text-sm group">
                  <Shield size={16} className="text-blue-500 group-hover:scale-110 transition-transform" /> 
                  Security Hub
                </li>
                <li className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors cursor-pointer font-medium text-sm group">
                  <Globe size={16} className="text-blue-500 group-hover:scale-110 transition-transform" /> 
                  API Documentation
                </li>
              </ul>
            </div>

            {/* SOCIALS SECTION */}
            <div>
              <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Socials</h4>
              <div className="flex gap-3">
                <a href="https://github.com/anmol12-gib" target="_blank" rel="noopener noreferrer">
                  <SocialIcon icon={<Github size={20} />} />
                </a>
                <a href="https://www.linkedin.com/in/anmol-virmani-419384286/" target="_blank" rel="noopener noreferrer">
                  <SocialIcon icon={<Linkedin size={20} />} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/[0.03] gap-6">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">© 2026 CYBERFLOW ENGINE CORE. All rights reserved.</p>
            <div className="flex gap-10">
              <button className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">Privacy Policy</button>
              <button className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] hover:text-blue-500 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {showProfile && <ProfilePanel onClose={() => setShowProfile(false)} />}
    </div>
  );
}

// 🔥 SUB-COMPONENTS
function TheoryItem({ icon, title, desc }: any) {
  return (
    <div className="group flex gap-4 p-4 rounded-2xl border border-transparent hover:border-white/[0.05] hover:bg-white/[0.02] transition-all">
      <div className="mt-1 text-blue-500">{icon}</div>
      <div>
        <h5 className="text-white text-sm font-bold uppercase tracking-wider mb-1 italic">{title}</h5>
        <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SocialIcon({ icon }: any) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all cursor-pointer shadow-xl hover:-translate-y-1">
      {icon}
    </div>
  );
}