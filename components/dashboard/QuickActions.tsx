import { Plus, CheckSquare, Video } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="quick-actions-grid">
      <Link href="/editor/new" className="action-card new-story group">
        <div className="icon-wrapper primary ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all duration-300">
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
        </div>
        <div className="action-info">
          <h4 className="group-hover:text-primary transition-colors">New Story</h4>
          <p>Conjure a new world with AI assistance.</p>
        </div>
        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right text-primary"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </Link>
      
      <Link href="/editor/new?mode=youtube" className="action-card new-script group">
        <div className="icon-wrapper youtube ring-4 ring-secondary/10 group-hover:ring-secondary/20 transition-all duration-300">
          <Video size={24} className="group-hover:scale-110 transition-transform" />
        </div>
        <div className="action-info">
          <h4 className="group-hover:text-secondary transition-colors">New Script</h4>
          <p>Draft a structured YouTube storytelling script.</p>
        </div>
        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right text-secondary"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </Link>
      
      <Link href="/planner" className="action-card continue group border-dashed hover:border-solid">
        <div className="icon-wrapper secondary ring-4 ring-white/5 group-hover:ring-white/10 transition-all duration-300">
          <CheckSquare size={24} />
        </div>
        <div className="action-info">
          <h4 className="group-hover:text-foreground transition-colors">Story Planner</h4>
          <p>Organize characters, plots, and timelines.</p>
        </div>
      </Link>
    </div>
  );
}
