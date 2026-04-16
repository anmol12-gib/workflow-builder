import React, { useState, useMemo } from "react";
import { useWorkflowStore } from "../store";
import { X, Layers, ShieldCheck, ShieldAlert, Eye, EyeOff } from "lucide-react";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { setCurrentUser, currentUser } = useWorkflowStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validation = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const isValid = Object.values(validation).every(Boolean);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (mode === "signup" && !isValid)) return;
    
    setCurrentUser({
      id: Date.now().toString(),
      email,
      displayName: email.split('@')[0],
    });
    onClose();
  };

  const safeClose = () => {
    if (currentUser) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000] p-6 font-sans">
      {/* Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* The "Playcard" Container */}
      <div className="relative w-full max-w-[380px] bg-[#0A0A0B] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        
        <button onClick={safeClose} className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
            <Layers size={24} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight uppercase italic">
            {mode === "login" ? "Access Portal" : "New Identity"}
          </h2>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1.5">
            Cyberflow V2 // Terminal
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
              placeholder="operator@nsut.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[34px] text-slate-600 hover:text-white"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <SecurityItem label="8+ Chars" met={validation.length} />
              <SecurityItem label="Uppercase" met={validation.upper} />
              <SecurityItem label="Lowercase" met={validation.lower} />
              <SecurityItem label="Number" met={validation.number} />
              <div className="col-span-2">
                <SecurityItem label="Special Character" met={validation.special} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={mode === "signup" && !isValid}
            className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              mode === "signup" && !isValid 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10'
            }`}
          >
            {mode === "login" ? "Authorize" : "Initialize"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {mode === "login" ? "No account?" : "Registered?"}
            <button 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="ml-2 text-blue-500 hover:text-blue-400 font-black"
            >
              {mode === "login" ? "Switch to Signup" : "Switch to Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SecurityItem({ label, met }: { label: string, met: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-tight ${met ? 'text-emerald-500' : 'text-slate-700'}`}>
      {met ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
      {label}
    </div>
  );
}