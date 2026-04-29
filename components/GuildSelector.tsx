"use client";

import { useEffect, useState } from "react";
import { Shield, Sparkles, Book, Target } from "lucide-react";

const GUILDS = [
  { id: "arcane", name: "Arcane Circle", icon: <Sparkles size={16} /> },
  { id: "vanguard", name: "Vanguard", icon: <Shield size={16} /> },
  { id: "shadow", name: "Shadow Order", icon: <Target size={16} /> },
  { id: "scribes", name: "Scribes", icon: <Book size={16} /> },
];

export function GuildSelector() {
  const [activeGuild, setActiveGuild] = useState("arcane");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedGuild = localStorage.getItem("storyforge-guild") || "arcane";
    setActiveGuild(savedGuild);
    document.documentElement.setAttribute("data-guild", savedGuild);
  }, []);

  const handleGuildSelect = (guildId: string) => {
    setActiveGuild(guildId);
    localStorage.setItem("storyforge-guild", guildId);
    document.documentElement.setAttribute("data-guild", guildId);
  };

  if (!mounted) return <div className="h-16" />; // prevent hydration mismatch

  return (
    <div className="guild-selector w-full">
      <div className="text-[10px] text-muted mb-3 font-bold uppercase tracking-[0.2em] opacity-60">Guild Identity</div>
      <div className="grid grid-cols-2 gap-2">
        {GUILDS.map((guild) => {
          const isActive = activeGuild === guild.id;
          return (
            <button
              key={guild.id}
              onClick={() => handleGuildSelect(guild.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 border ${
                isActive 
                  ? 'bg-primary/10 text-primary border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                  : 'text-text-muted hover:bg-white/5 border-transparent hover:border-white/10'
              }`}
            >
              <div className={`${isActive ? 'scale-110' : 'opacity-70'} transition-transform duration-300`}>
                {guild.icon}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate w-full text-center">
                {guild.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
