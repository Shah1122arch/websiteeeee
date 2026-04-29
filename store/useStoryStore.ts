import { create } from "zustand";
import { Story, Chapter } from "../types/story";
import { updateChapterInDB } from "../lib/db";

interface StoryState {
  stories: Story[];
  currentStory: Story | null;
  activeChapterId: string | null;
  isSaving: boolean;
  saveStatus: "Saved" | "Saving..." | "Unsaved";
  addStory: (story: Story) => void;
  setCurrentStory: (storyId: string) => void;
  updateStory: (id: string, data: Partial<Story>) => void;
  addChapter: (storyId: string, chapter: Chapter) => void;
  updateChapter: (storyId: string, chapterId: string, content: any, userId?: string) => void;
  setActiveChapter: (chapterId: string | null) => void;
}

const mockInitialLibrary: Story[] = [
  {
    id: "story-1",
    title: "The Midnight Chronograph",
    genre: "Sci-Fi",
    description: "A detective must solve a murder across three different timelines.",
    coverImage: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mode: "story",
    tone: "neutral",
    chapters: [
      {
        id: "chap-1",
        title: "Chapter 1: The First Jump",
        content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "The rain fell straight through him, as if time itself had forgotten he was there." }] }] },
        order: 1,
      },
    ],
  },
];

let saveTimeout: any = null;

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: mockInitialLibrary,
  currentStory: null,
  activeChapterId: null,
  isSaving: false,
  saveStatus: "Saved",

  addStory: (story) =>
    set((state) => ({ stories: [...state.stories, story] })),
    
  setCurrentStory: (storyId) =>
    set((state) => ({
      currentStory: state.stories.find((s) => s.id === storyId) || null,
      activeChapterId: state.stories.find((s) => s.id === storyId)?.chapters[0]?.id || null,
    })),

  updateStory: (id, data) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === id ? { ...s, ...data } : s)),
      currentStory:
        state.currentStory?.id === id
          ? { ...state.currentStory, ...data }
          : state.currentStory,
    })),

  addChapter: (storyId, chapter) =>
    set((state) => {
      const updatedStories = state.stories.map((s) =>
        s.id === storyId ? { ...s, chapters: [...s.chapters, chapter] } : s
      );
      const isCurrentStory = state.currentStory?.id === storyId;
      return {
        stories: updatedStories,
        currentStory: isCurrentStory
          ? { ...state.currentStory!, chapters: [...state.currentStory!.chapters, chapter] }
          : state.currentStory,
      };
    }),

  updateChapter: (storyId, chapterId, content, userId = "local-guest") => {
    // 1. Update local state immediately for snappy UI
    set((state) => {
      const updatedStories = state.stories.map((s) => {
        if (s.id !== storyId) return s;
        return {
          ...s,
          chapters: s.chapters.map((c) =>
            c.id === chapterId ? { ...c, content } : c
          ),
        };
      });

      const isCurrentStory = state.currentStory?.id === storyId;
      return {
        stories: updatedStories,
        currentStory: isCurrentStory
          ? {
              ...state.currentStory!,
              chapters: state.currentStory!.chapters.map((c) =>
                c.id === chapterId ? { ...c, content } : c
              ),
            }
          : state.currentStory,
        isSaving: true,
        saveStatus: "Saving..."
      };
    });

    // 2. Debounce Firestore save (e.g. 2.5 seconds after last keystroke)
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(async () => {
      try {
        await updateChapterInDB(storyId, chapterId, content, userId);
        set({ isSaving: false, saveStatus: "Saved" });
      } catch (e) {
        console.error("Autosave Failed", e);
        set({ isSaving: false, saveStatus: "Unsaved" });
      }
    }, 2500);
  },

  setActiveChapter: (chapterId) => set({ activeChapterId: chapterId }),
}));
