import { db } from "./firebase";
import { doc, setDoc, updateDoc, collection, serverTimestamp, getDocs, query, where, getDoc, orderBy } from "firebase/firestore";
import { Story, Chapter, Version } from "../types/story";
import { v4 as uuidv4 } from "uuid";

// Only proceed if FIREBASE config is actually set (to prevent crashes in local MVP mode)
const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export const saveStoryToDB = async (story: Story, userId: string) => {
  if (!isFirebaseConfigured) return;
  const storyRef = doc(db, "stories", story.id);
  await setDoc(storyRef, {
    ...story,
    userId,
    updatedAt: serverTimestamp(),
  });
};

export const updateChapterInDB = async (storyId: string, chapterId: string, content: any, userId: string) => {
  if (!isFirebaseConfigured) return;

  const storyRef = doc(db, "stories", storyId);
  const storySnap = await getDoc(storyRef);
  
  if (storySnap.exists()) {
    const data = storySnap.data() as Story;
    const updatedChapters = data.chapters.map(c => 
      c.id === chapterId ? { ...c, content } : c
    );
    
    await updateDoc(storyRef, {
      chapters: updatedChapters,
      updatedAt: serverTimestamp()
    });
  }
};

export const saveVersion = async (storyId: string, content: any): Promise<Version | null> => {
  if (!isFirebaseConfigured) return null;
  const versionId = uuidv4();
  const versionRef = doc(db, "versions", versionId);
  
  const version: Version = {
    id: versionId,
    storyId,
    content,
    createdAt: Date.now(),
  };

  await setDoc(versionRef, version);
  return version;
};

export const getVersions = async (storyId: string): Promise<Version[]> => {
  if (!isFirebaseConfigured) return [];
  const versionsRef = collection(db, "versions");
  const q = query(versionsRef, where("storyId", "==", storyId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as Version);
};
