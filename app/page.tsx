"use client";

import { useStoryStore } from "../store/useStoryStore";
import { StoryCard } from "../components/dashboard/StoryCard";
import { QuickActions } from "../components/dashboard/QuickActions";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const stories = useStoryStore((state) => state.stories);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get 3 most recent stories based on updatedAt
  const recentStories = [...stories]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (!mounted) return null;

  return (
    <div className="dashboard-container relative">
      {/* Subtle Mesh Background Glows */}
      <div className="bg-glow bg-glow-primary"></div>
      <div className="bg-glow bg-glow-secondary"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.header variants={itemVariants} className="page-header relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              Writer Status: Active
            </span>
          </div>
          <h1>Shape your narrative.</h1>
          <p className="dashboard-tagline">
            Welcome back, Author. Your worlds are waiting for their next chapter.
          </p>
        </motion.header>
        
        <div className="bento-grid">
          <motion.section variants={itemVariants} className="bento-main">
            <div className="section-header">
              <h2 className="section-title">Continue your story</h2>
              <button className="btn-ghost" onClick={() => window.location.href = '/library'}>View All</button>
            </div>
            
            {recentStories.length > 0 ? (
              <div className="recent-stories-grid">
                {recentStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="empty-state card">
                <p>Your creative space is empty. Let's shape your first narrative.</p>
              </div>
            )}
          </motion.section>

          <motion.section variants={itemVariants} className="bento-side space-y-6">
            <div>
              <h2 className="section-title mb-4">Quick Actions</h2>
              <QuickActions />
            </div>

            <div className="card inspiration-card mt-6">
              <div className="inspiration-header flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <h3 className="text-sm font-bold uppercase tracking-tight">Daily Inspiration</h3>
              </div>
              <p className="text-sm italic text-muted leading-relaxed">
                "The first draft is just you telling yourself the story." 
                <span className="block mt-2 font-semibold not-italic">— Terry Pratchett</span>
              </p>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}
