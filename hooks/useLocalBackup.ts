import { useEffect, useState } from "react";
import { Story } from "../types/story";

export const useLocalBackup = (storyId: string, currentContent: any) => {
  const [hasBackup, setHasBackup] = useState(false);

  // Load from backup if available
  useEffect(() => {
    const backup = localStorage.getItem(`backup_${storyId}`);
    if (backup) {
      setHasBackup(true);
    }
  }, [storyId]);

  // Save on changes and beforeunload
  useEffect(() => {
    if (!currentContent) return;
    
    const backupData = JSON.stringify({
      content: currentContent,
      timestamp: Date.now(),
    });

    // Save to local storage on a slight debounce
    const timeout = setTimeout(() => {
      localStorage.setItem(`backup_${storyId}`, backupData);
    }, 1000);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      localStorage.setItem(`backup_${storyId}`, backupData);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [storyId, currentContent]);

  const clearBackup = () => {
    localStorage.removeItem(`backup_${storyId}`);
    setHasBackup(false);
  };

  const getBackup = () => {
    const backup = localStorage.getItem(`backup_${storyId}`);
    return backup ? JSON.parse(backup) : null;
  };

  return { hasBackup, clearBackup, getBackup };
};
