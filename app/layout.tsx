import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { BookOpen, Home, Settings, PenTool } from "lucide-react";
import { AuthProvider } from "../components/AuthProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { GuildSelector } from "../components/GuildSelector";
import { MagicalDust } from "../components/MagicalDust";

export const metadata: Metadata = {
  title: "StoryForge | Premium Writing Platform",
  description: "A modern platform for Wattpad-style writing and YouTube storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} themes={['light', 'dark']}>
          <div className="layout-wrapper">
          {/* Global Sidebar / Navigation */}
          <aside className="sidebar">
            <div className="logo">
              <PenTool size={28} className="logo-icon" />
              <span>StoryForge</span>
            </div>
            <nav className="nav-menu">
              <Link href="/" className="nav-item">
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
              <Link href="/library" className="nav-item">
                <BookOpen size={20} />
                <span>Library</span>
              </Link>
              <Link href="/settings" className="nav-item">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </nav>
            <div className="mt-auto pt-4 flex flex-col gap-6 border-t border-border/40">
              <div className="px-2">
                <GuildSelector />
              </div>
              <div className="px-2">
                <ThemeSwitcher />
              </div>
            </div>
            <div className="user-profile mt-4">
              <div className="avatar">A</div>
              <div className="user-info">
                <div className="user-name">Author Mode</div>
                <div className="user-status">Local MVP</div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="main-content">
            <AuthProvider>
              <MagicalDust />
              {children}
            </AuthProvider>
          </main>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
