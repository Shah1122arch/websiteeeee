import { useEffect, useState } from "react";
import { getVersions } from "../../lib/db";
import { Version } from "../../types/story";
import { Editor } from "@tiptap/react";
import { useAuth } from "../../components/AuthProvider";
import { X, Clock, RotateCcw } from "lucide-react";
import { useStoryStore } from "../../store/useStoryStore";

interface Props {
  storyId: string;
  currentChapterId: string;
  editor: Editor | null;
  onClose: () => void;
}

export function VersionHistoryPanel({ storyId, currentChapterId, editor, onClose }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateChapter } = useStoryStore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      const v = await getVersions(storyId);
      setVersions(v);
      setLoading(false);
    };
    fetchVersions();
  }, [storyId]);

  const handleRestore = (version: Version) => {
    if (!editor) return;
    if (confirm("Are you sure you want to restore this version? This will overwrite your current progress.")) {
      editor.commands.setContent(version.content);
      const userId = user?.uid || "guest";
      updateChapter(storyId, currentChapterId, version.content, userId);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-surface border-l border-border shadow-xl z-50 flex flex-col slide-in-right">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="font-bold flex items-center gap-2"><Clock size={18}/> History</h3>
        <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded"><X size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-muted">Loading versions...</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-muted">No versions found.</p>
        ) : (
          versions.map(v => {
            const date = new Date(v.createdAt);
            return (
              <div key={v.id} className="p-3 border border-border rounded bg-background hover:bg-surface-hover transition flex flex-col gap-2">
                <span className="text-xs text-muted block">
                  {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </span>
                <button 
                  onClick={() => handleRestore(v)}
                  className="btn-secondary btn-sm flex justify-center items-center gap-2"
                >
                  <RotateCcw size={14}/> Restore
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
