import React, { useState, useEffect } from "react";
import { useWorkflowStore } from "../store";
import { 
  X, Upload, User, Mail, Phone, GraduationCap, 
  AlignLeft, LogOut, Terminal, ShieldCheck
} from "lucide-react";

export default function ProfilePanel({ onClose }: any) {
  const { currentUser, setCurrentUser, updateUser } = useWorkflowStore();
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    university: "",
    bio: "",
    avatar: "",
    skills: ""
  });

  // 🔥 Sync local form with persisted global state on load/update
  useEffect(() => {
    if (currentUser) {
      setForm({
        displayName: currentUser.displayName || "Anmol",
        phone: currentUser.phone || "",
        university: currentUser.university || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || "",
        skills: currentUser.skills || "React, Node.js, TypeScript"
      });
    }
  }, [currentUser]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateUser(form); // Saves to global store + localStorage
    setEditMode(false); // 🔥 Swaps button back to "Modify Protocol"
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      <div 
        className="relative w-full max-w-2xl bg-[#050505] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row h-auto max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Identity */}
        <div className="w-full md:w-1/3 bg-white/[0.02] border-r border-white/[0.05] p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-[2rem] bg-[#0A0A0A] border border-white/10 p-1 overflow-hidden group">
              {form.avatar ? (
                <img src={form.avatar} className="w-full h-full object-cover rounded-[1.7rem]" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-[#080808] rounded-[1.7rem] flex items-center justify-center">
                   <User size={32} className="text-slate-800" />
                </div>
              )}
              {editMode && (
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer rounded-[2rem]">
                  <Upload size={20} className="text-white" />
                  <input type="file" className="hidden" onChange={handleAvatar} />
                </label>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-lg border-2 border-[#050505]">
              <ShieldCheck size={12} className="text-white" />
            </div>
          </div>
          <h3 className="text-base font-black text-white italic uppercase tracking-tighter">{form.displayName}</h3>
          <div className="mt-6 w-full px-4">
             <button onClick={() => { setCurrentUser(null); onClose(); }} className="w-full py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-[8px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all">
               Logout System
             </button>
          </div>
        </div>

        {/* Right Side: Fields */}
        <div className="flex-grow p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Dossier Details</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 gap-3 flex-grow overflow-hidden">
            <CardField label="Identity Alias" value={form.displayName} disabled={!editMode} onChange={(v: string) => setForm({...form, displayName: v})} icon={<User />} />
            <CardField label="Communication" value={currentUser?.email || "anmol.virmani.ug23@nsut.ac.in"} disabled icon={<Mail />} />
            
            <div className="grid grid-cols-2 gap-3">
              <CardField label="Secure Line" value={form.phone} disabled={!editMode} onChange={(v: string) => setForm({...form, phone: v})} icon={<Phone />} />
              <CardField label="Operations Base" value={form.university} disabled={!editMode} onChange={(v: string) => setForm({...form, university: v})} icon={<GraduationCap />} />
            </div>
            
            <CardField label="Skill Matrix" value={form.skills} disabled={!editMode} onChange={(v: string) => setForm({...form, skills: v})} icon={<Terminal />} />
            <CardField label="Summary" value={form.bio} disabled={!editMode} onChange={(v: string) => setForm({...form, bio: v})} icon={<AlignLeft />} isTextArea />
          </div>

          <div className="mt-6">
            {editMode ? (
              <button onClick={handleSave} className="w-full bg-blue-600 py-3.5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Commit Changes
              </button>
            ) : (
              <button onClick={() => setEditMode(true)} className="w-full bg-white/5 border border-white/10 py-3.5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.4em]">
                Modify Protocol
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardField({ label, value, onChange, disabled, icon, isTextArea }: any) {
  const sharedClass = "w-full bg-[#080808] border border-white/5 p-2.5 rounded-xl text-[13px] text-slate-200 focus:border-blue-500/50 outline-none disabled:opacity-30";
  return (
    <div className="group">
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
        <span className="text-blue-500">{icon && React.cloneElement(icon as React.ReactElement<any>, { size: 10 })}</span>
        {label}
      </p>
      {isTextArea ? (
        <textarea value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={`${sharedClass} h-14 resize-none`} />
      ) : (
        <input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={sharedClass} />
      )}
    </div>
  );
}