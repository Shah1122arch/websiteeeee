"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="theme-switcher-placeholder" />;
  }

  const themes = [
    { name: "dark", icon: <Moon size={16} />, label: "Dark Env" },
    { name: "light", icon: <Sun size={16} />, label: "Light Env" },
  ];

  return (
    <div className="theme-switcher px-2">
      <div className="theme-label text-xs text-muted mb-2 px-2 font-bold uppercase tracking-wider">Environment</div>
      <div className="theme-options flex gap-1 p-1 bg-surface-hover rounded-md border border-border/50">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`flex-1 flex justify-center items-center py-1.5 rounded-sm transition-all duration-200 ${
              theme === t.name 
                ? 'bg-surface text-foreground shadow-sm border border-border' 
                : 'text-text-muted hover:text-foreground'
            }`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
