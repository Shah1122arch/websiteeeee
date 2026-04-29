export type Chapter = {
  id: string;
  title: string;
  content: any; // TipTap structured JSON
  order: number;
};

export type Story = {
  id: string;
  title: string;
  genre: string;
  description: string;
  coverImage: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  mode: "story" | "youtube"; // Output context representation
  tone: "hero" | "villain" | "neutral"; // Duality system
  chapters: Chapter[];
};

export type ScriptFormat = {
  hook: string;
  intro: string;
  body: string;
  outro: string;
};

export type Version = {
  id: string;
  storyId: string;
  content: any; // TipTap structured JSON
  createdAt: number; // timestamp
};

