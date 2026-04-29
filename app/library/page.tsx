"use client";

import { useStoryStore } from "../../store/useStoryStore";
import { StoryCard } from "../../components/dashboard/StoryCard";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export default function LibraryPage() {
  const stories = useStoryStore((state) => state.stories);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = stories.filter((story) => 
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Your Library</h1>
        <p>All your stories and scripts in one place.</p>
      </header>

      <div className="library-controls">
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search stories by title or genre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-secondary">
          <Filter size={18} /> Filter
        </button>
      </div>

      {filteredStories.length > 0 ? (
        <div className="stories-grid">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <p>No stories found matching your search.</p>
        </div>
      )}
    </div>
  );
}
