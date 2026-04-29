"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useTheme } from "next-themes";
import { 
  User, 
  Settings, 
  Sparkles, 
  Moon, 
  Sun, 
  Type, 
  Volume2, 
  Database, 
  Trash2, 
  LogOut, 
  Shield, 
  Target, 
  Book, 
  ChevronRight, 
  Globe,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const GUILDS = [
  { id: "arcane", name: "Arcane Circle", desc: "Mystical purple energy & blue glows", color: "#7c3aed" },
  { id: "vanguard", name: "Vanguard", desc: "Heroic golden light & red accents", color: "#facc15" },
  { id: "shadow", name: "Shadow Order", desc: "Stealthy crimson edge & deep blues", color: "#e11d48" },
  { id: "scribes", name: "Scribes Order", desc: "Warm parchment & classic amber", color: "#d97706" },
];

export default function SettingsHub() {
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeGuild, setActiveGuild] = useState("arcane");
  
  // Local Settings State
  const [penName, setPenName] = useState("Author Mode");
  const [language, setLanguage] = useState("English");
  const [glowIntensity, setGlowIntensity] = useState("medium");
  const [focusModeDefault, setFocusModeDefault] = useState(false);
  const [typewriterMode, setTypewriterMode] = useState(true);
  
  // UI State
  const [modal, setModal] = useState<{ type: "logout" | "clear" | "reset" | null }>({ type: null });

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const savedGuild = localStorage.getItem("storyforge-guild") || "arcane";
    setActiveGuild(savedGuild);
    
    setPenName(localStorage.getItem("sf-pen-name") || "Author Mode");
    setLanguage(localStorage.getItem("sf-language") || "English");
    setGlowIntensity(localStorage.getItem("sf-glow") || "medium");
    setFocusModeDefault(localStorage.getItem("sf-focus-default") === "true");
    setTypewriterMode(localStorage.getItem("sf-typewriter") !== "false");
  }, []);

  const saveSetting = (key: string, value: any) => {
    localStorage.setItem(`sf-${key}`, value.toString());
  };

  const handleGuildChange = (id: string) => {
    setActiveGuild(id);
    localStorage.setItem("storyforge-guild", id);
    document.documentElement.setAttribute("data-guild", id);
  };

  if (!mounted) return <div className="h-screen bg-background" />;

  const handleLogout = async () => {
    await signOutUser();
    router.push("/login");
  };

  const clearBackups = () => {
    // Simulated backup clearing
    alert("Local archives purged. Your sanctuary is clean.");
    setModal({ type: null });
  };

  const resetPreferences = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="dashboard-container max-w-4xl py-20 px-8">
      <header className="page-header mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="text-primary" size={24} />
          <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Sanctuary Config</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter">Settings Hub</h1>
        <p className="dashboard-tagline">Customize your writing environment, identity, and AI essence.</p>
      </header>

      <div className="flex flex-col gap-10">
        
        {/* Section 1: Account Sanctuary */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted/60 flex items-center gap-2">
            <User size={14} /> Account Sanctuary
          </h3>
          <div className="settings-card grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-primary mb-1 block">Pen Name</label>
                <input 
                  type="text" 
                  value={penName}
                  onChange={(e) => { setPenName(e.target.value); saveSetting("pen-name", e.target.value); }}
                  className="bg-black/20 border border-white/5 rounded-lg px-4 py-2 w-full text-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted mb-1 block">Soul Origin (Email)</label>
                <div className="text-sm text-muted/80 px-4 py-2 bg-black/10 rounded-lg border border-white/5">
                  {user?.email || "Guest Navigator"}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-start md:items-end">
              <button 
                onClick={() => setModal({ type: "logout" })}
                className="destructive-btn w-full md:w-auto"
              >
                <LogOut size={16} /> Disconnect Essence (Logout)
              </button>
              <p className="text-[10px] text-muted text-right">Disconnecting will sync your current drafts to local storage only.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Aesthetic Identity */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted/60 flex items-center gap-2">
            <Sparkles size={14} /> Aesthetic Identity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theme Picker */}
            <div className="settings-card">
              <label className="text-[10px] font-bold uppercase text-primary mb-4 block">Visual Environment</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`preview-card group ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="absolute inset-0 bg-[#0f0f1c]" />
                  <div className="preview-label">Midnight (Dark)</div>
                  {theme === 'dark' && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-primary rounded-full"><ChevronRight size={12} className="text-black" /></div>}
                </div>
                <div 
                  className={`preview-card group ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <div className="absolute inset-0 bg-[#f8fafc]" />
                  <div className="preview-label text-black">Daylight (Light)</div>
                  {theme === 'light' && <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-primary rounded-full"><ChevronRight size={12} className="text-black" /></div>}
                </div>
              </div>
            </div>

            {/* Language Selection */}
            <div className="settings-card">
               <label className="text-[10px] font-bold uppercase text-primary mb-4 block">Universal Language</label>
               <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                  <Globe className="text-muted" size={24} />
                  <div className="flex-1">
                    <select 
                      value={language}
                      onChange={(e) => { setLanguage(e.target.value); saveSetting("language", e.target.value); }}
                      className="bg-transparent border-none outline-none text-sm font-bold w-full cursor-pointer"
                    >
                      <option value="English">English (Universal)</option>
                      <option value="Spanish">Español (Castilian)</option>
                      <option value="French">Français (Archaic)</option>
                      <option value="German">Deutsch (Logic)</option>
                    </select>
                    <p className="text-[9px] text-muted uppercase mt-1">Interface & AI Suggestion Language</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Guild Picker Dashboard */}
          <div className="settings-card">
            <label className="text-[10px] font-bold uppercase text-primary mb-6 block">Guild Allegiance</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GUILDS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGuildChange(g.id)}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-500 overflow-hidden group ${
                    activeGuild === g.id 
                      ? 'border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]' 
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div 
                    className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity" 
                    style={{ background: `radial-gradient(circle at top right, ${g.color}, transparent)` }}
                  />
                  <div className={`mb-3 transition-transform duration-500 ${activeGuild === g.id ? 'scale-110 text-primary' : 'text-muted'}`}>
                    {g.id === "arcane" && <Sparkles size={24} />}
                    {g.id === "vanguard" && <Shield size={24} />}
                    {g.id === "shadow" && <Target size={24} />}
                    {g.id === "scribes" && <Book size={24} />}
                  </div>
                  <h4 className="text-sm font-bold mb-1">{g.name}</h4>
                  <p className="text-[10px] text-muted font-medium line-clamp-2">{g.desc}</p>
                  
                  {activeGuild === g.id && (
                    <motion.div 
                      layoutId="guild-check"
                      className="absolute top-3 right-3 text-primary"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Editor Preferences */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted/60 flex items-center gap-2">
            <Type size={14} /> Editor Preferences
          </h3>
          <div className="settings-card grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Default Focus Mode</h4>
                  <p className="text-[10px] text-muted">Automatically clear sidebars on sanctuary entry.</p>
                </div>
                <div 
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${focusModeDefault ? 'bg-primary' : 'bg-muted/20'}`}
                  onClick={() => { setFocusModeDefault(!focusModeDefault); saveSetting("focus-default", !focusModeDefault); }}
                >
                  <motion.div 
                    className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                    animate={{ x: focusModeDefault ? 20 : 0 }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Typewriter Mode</h4>
                  <p className="text-[10px] text-muted">Keep current line always centered verticaly.</p>
                </div>
                <div 
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${typewriterMode ? 'bg-primary' : 'bg-muted/20'}`}
                  onClick={() => { setTypewriterMode(!typewriterMode); saveSetting("typewriter", !typewriterMode); }}
                >
                  <motion.div 
                    className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                    animate={{ x: typewriterMode ? 20 : 0 }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Monitor size={14} className="text-primary" /> Sanctuary Glow Intensity
                  </h4>
                  <div className="toggle-group">
                    {['low', 'medium', 'high'].map((level) => (
                      <div 
                        key={level}
                        className={`toggle-item ${glowIntensity === level ? 'active' : ''}`}
                        onClick={() => { setGlowIntensity(level); saveSetting("glow", level); }}
                      >
                        {level.toUpperCase()}
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 4: Data & Storage */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted/60 flex items-center gap-2">
            <Database size={14} /> Data & Flow
          </h3>
          <div className="settings-card grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
               <div className="text-[11px] font-bold text-muted uppercase">Local Sanctum Usage</div>
               <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-gradient-to-r from-primary to-secondary w-[12%]" />
               </div>
               <div className="flex justify-between text-[10px] text-muted/60">
                 <span>1.2 MB Used</span>
                 <span>500 MB Capacity (IndexedDB)</span>
               </div>
            </div>
            <div className="flex flex-col gap-3 items-start md:items-end">
               <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setModal({ type: "clear" })}
                    className="btn-secondary py-3 px-4 text-[10px] font-bold uppercase flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Purge Backups
                  </button>
                  <button 
                    onClick={() => setModal({ type: "reset" })}
                    className="btn-secondary py-3 px-4 text-[10px] font-bold uppercase bg-red-500/5 hover:bg-red-500/10 border-red-500/20"
                  >
                    Full Reset
                  </button>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {modal.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-background/80 backdrop-blur-md"
               onClick={() => setModal({ type: null })}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="card w-full max-w-md relative z-10 p-8 border-primary/20 shadow-2xl"
            >
              <div className="mb-6">
                <h4 className="text-2xl font-bold mb-2">
                  {modal.type === "logout" && "Sever Essence Connection?"}
                  {modal.type === "clear" && "Purge Local Archives?"}
                  {modal.type === "reset" && "Complete Sanctuary Wipe?"}
                </h4>
                <p className="text-muted text-sm line-height-relaxed">
                  {modal.type === "logout" && "Are you sure you want to log out? Your local drafts are safe, but cloud synchronization will pause."}
                  {modal.type === "clear" && "This will delete all local autosaves and story backups. This action cannot be undone."}
                  {modal.type === "reset" && "CRITICAL: This will wipe ALL your stories, preferences, and account links from this device. Proceed with extreme caution."}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    if (modal.type === "logout") handleLogout();
                    if (modal.type === "clear") clearBackups();
                    if (modal.type === "reset") resetPreferences();
                  }}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    modal.type === "logout" ? 'bg-primary text-black' : 'bg-red-500 text-white'
                  }`}
                >
                  Confirm Action
                </button>
                <button 
                  onClick={() => setModal({ type: null })}
                  className="py-3 bg-surface rounded-xl font-bold text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
