// Helper functions for story statistics and analytics

export const getWordCount = (content: string): number => {
  if (!content) return 0;
  // Replace HTML tags with spaces and trim
  const cleanText = content.replace(/<[^>]*>?/gm, " ").trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).filter((word) => word.length > 0).length;
};

export const estimateReadingTime = (wordCount: number): string => {
  const WPM = 250; // Average reading speed
  const minutes = Math.ceil(wordCount / WPM);
  
  if (minutes < 1) return "< 1 min read";
  if (minutes === 1) return "1 min read";
  return `${minutes} mins read`;
};

// Goals and gamification tracking
export const updateDailyGoal = (additionalWords: number) => {
  const today = new Date().toISOString().split('T')[0];
  const goalKey = `goal_${today}`;
  
  const currentProgressStr = localStorage.getItem(goalKey);
  const currentProgress = currentProgressStr ? parseInt(currentProgressStr, 10) : 0;
  
  const newProgress = currentProgress + additionalWords;
  localStorage.setItem(goalKey, newProgress.toString());
  
  return newProgress;
};

export const getDailyProgress = () => {
  const today = new Date().toISOString().split('T')[0];
  const goalKey = `goal_${today}`;
  const currentProgressStr = localStorage.getItem(goalKey);
  return currentProgressStr ? parseInt(currentProgressStr, 10) : 0;
};

// AI Usage limits for basic monetization
export const incrementAIToken = () => {
  const today = new Date().toISOString().split('T')[0];
  const aiKey = `ai_usage_${today}`;
  
  const currentUsageStr = localStorage.getItem(aiKey);
  const currentUsage = currentUsageStr ? parseInt(currentUsageStr, 10) : 0;
  
  const newUsage = currentUsage + 1;
  localStorage.setItem(aiKey, newUsage.toString());
  
  return newUsage;
};

export const getAIUsage = () => {
  const today = new Date().toISOString().split('T')[0];
  const aiKey = `ai_usage_${today}`;
  const currentUsageStr = localStorage.getItem(aiKey);
  return currentUsageStr ? parseInt(currentUsageStr, 10) : 0;
};
export const MAX_FREE_AI_USES = 10;
