import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Story } from "../../types/story";

interface StoryCardProps {
  story: Story;
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/editor/${story.id}`} className="card story-card group">
      <div className="story-cover relative overflow-hidden">
        {story.coverImage ? (
          <img 
            src={story.coverImage} 
            alt={story.title} 
            className="transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="cover-placeholder">
            <span className="relative z-10">{story.title.substring(0, 2).toUpperCase()}</span>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-background mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Continue Writing</span>
          </div>
        </div>
      </div>
      <div className="story-info transition-colors duration-300 group-hover:bg-primary/5">
        <span className="story-genre">{story.genre}</span>
        <h3 className="story-title transition-colors group-hover:text-primary">{story.title}</h3>
        <p className="story-meta flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {formatDistanceToNow(new Date(story.updatedAt))} ago
        </p>
      </div>
    </Link>
  );
}
