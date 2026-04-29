"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState, use } from "react";
import { useStoryStore } from "../../../store/useStoryStore";
import { FloatingToolbar } from "../../../components/editor/FloatingToolbar";
import { AIBubbleMenu } from "../../../components/editor/AIBubbleMenu";
import { ScriptPane } from "../../../components/editor/ScriptPane";
import { useAuth } from "../../../components/AuthProvider";
import { DownloadCloud, Sparkles, Moon, Sun, Leaf, Music, Save, Clock, Target, Maximize2, Zap } from "lucide-react";
import { generateTitleAndThumbnail, generatePlotTwists } from "../../../lib/ai";
import { ArcaneOracle } from "../../../components/editor/ArcaneOracle";
import { useLocalBackup } from "../../../hooks/useLocalBackup";
import { getWordCount, updateDailyGoal, getDailyProgress, incrementAIToken, getAIUsage, MAX_FREE_AI_USES } from "../../../lib/analytics";
import { VersionHistoryPanel } from "../../../components/editor/VersionHistoryPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentStory, setCurrentStory, updateChapter, saveStatus } = useStoryStore();
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Arcane Oracle state
  const [showOracle, setShowOracle] = useState(false);
  const [oracleTwists, setOracleTwists] = useState<string[]>([]);
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  
  // Immersive variables
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [tone, setTone] = useState<"hero" | "villain" | "neutral">("neutral");
  const [ambientSound, setAmbientSound] = useState("None");
  const [wordCount, setWordCount] = useState(0);
  const [dailyProgress, setDailyProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setCurrentStory(id);
    setDailyProgress(getDailyProgress());
  }, [id, setCurrentStory]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(getWordCount(text));
      updateDailyGoal(1);
      setDailyProgress(getDailyProgress());

      if (currentStory && currentStory.chapters.length > 0) {
        const userId = user?.uid || "guest";
        updateChapter(currentStory.id, currentStory.chapters[0].id, editor.getJSON(), userId);
      }
    },
  });

  const { hasBackup, getBackup } = useLocalBackup(id, editor?.getJSON());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (currentStory?.tone) setTone(currentStory.tone);
  }, [currentStory]);

  useEffect(() => {
    if (editor && currentStory && currentStory.chapters.length > 0) {
      if (editor.getText() === "") {
        editor.commands.setContent(currentStory.chapters[0].content);
      }
    }
  }, [editor, currentStory]);

  if (!isClient || !currentStory) {
    return <div className="editor-loading h-screen flex items-center justify-center bg-background text-primary font-bold animate-pulse">Entering the Sanctuary...</div>;
  }

  const handleExportWattpad = () => {
    if (!editor) return;
    const text = editor.getText();
    const blob = new Blob([currentStory.title + "\n\n" + text.replace(/\n{3,}/g, '\n\n')], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${currentStory.title.replace(/\s+/g, '_')}_Wattpad.txt`;
    link.click();
  };

  const handleFetchAiSuggestions = async () => {
    if (!editor) return;
    const currentUsage = getAIUsage();
    if (currentUsage >= MAX_FREE_AI_USES) {
      alert("You have reached your daily AI limit for the free tier. Please upgrade to Pro for unlimited AI features!");
      return;
    }

    try {
      setLoadingSuggestions(true);
      const suggestions = await generateTitleAndThumbnail(editor.getText());
      setAiSuggestions(suggestions);
      incrementAIToken();
    } catch (e: any) {
      alert(e.message || "Failed to load suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleConjureTwist = async () => {
    if (!editor) return;
    
    const currentUsage = getAIUsage();
    if (currentUsage >= MAX_FREE_AI_USES) {
      alert("The Oracle's energy is depleted for today. Upgrade to Pro for unlimited visions.");
      return;
    }

    try {
      setShowOracle(true);
      setIsOracleLoading(true);
      
      // Extract last ~500 words for context
      const fullText = editor.getText();
      const words = fullText.split(/\s+/);
      const context = words.slice(-500).join(" ");

      const result = await generatePlotTwists(
        context || "A new story begins in the shadows...",
        tone,
        currentStory.genre
      );
      
      setOracleTwists(result.twists);
      incrementAIToken();
    } catch (e: any) {
      console.error("Oracle Failure:", e);
      // Fallback is handled by generatePlotTwists, but we still ensure loading stops
    } finally {
      setIsOracleLoading(false);
    }
  };

  const handleInsertTwist = (twist: string) => {
    if (!editor) return;
    
    editor.chain().focus().insertContent(`\n\n[ORACLE'S TWIST: ${twist}]\n\n`).run();
    setShowOracle(false);
  };

  return (
    <div className={`editor-layout tone-${tone} ${isFocusMode ? 'focus-mode-active' : ''} relative`}>
      {/* Background magical elements (Shared with Hub) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-glow bg-glow-primary opacity-10"></div>
        <div className="bg-glow bg-glow-secondary opacity-10"></div>
      </div>

      {/* Main Sanctuary Editor */}
      <main className="editor-main z-10 custom-scrollbar">
        <header className="editor-top-bar flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className={`save-status flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest ${saveStatus === 'Saving...' ? 'text-yellow-400' : 'text-green-500/80'}`}>
                 {saveStatus === 'Saving...' ? <Zap size={10} className="animate-pulse" /> : <Save size={10} />}
                 {saveStatus}
               </span>
            </div>
            
            <div className="h-4 w-[1px] bg-border" />
            
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Words: <span className="text-foreground">{wordCount}</span></span>
              <div className="flex items-center gap-2">
                 <div className="w-24 h-1 bg-surface-hover rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (dailyProgress / 1000) * 100)}%` }}
                    />
                 </div>
                 <span className="text-[9px] font-bold text-muted uppercase">{dailyProgress}/1k</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Immersive Audio Toggle */}
            <div className="flex items-center gap-2 bg-surface/50 border border-border px-2 py-1 rounded-lg">
               <Music size={14} className="text-muted" />
               <select 
                 className="bg-transparent border-none outline-none text-[10px] font-bold uppercase cursor-pointer"
                 value={ambientSound}
                 onChange={(e) => setAmbientSound(e.target.value)}
               >
                 <option value="None">Silence</option>
                 <option value="Rain">Rain</option>
                 <option value="Cafe">Cafe</option>
                 <option value="Forest">Forest</option>
               </select>
            </div>

            {/* Tone (Duality) Selector */}
            <div className="flex items-center gap-1 bg-surface/80 rounded-xl p-1 border border-border/50">
              {([
                { value: "hero", icon: <Target size={14} />, title: "Heroic Way" },
                { value: "neutral", icon: <Moon size={14} />, title: "Neutral Balance" },
                { value: "villain", icon: <Zap size={14} />, title: "Villainous Path" },
              ] as const).map(t => (
                <button
                  key={t.value}
                  title={t.title}
                  onClick={() => setTone(t.value)}
                  className={`p-2 rounded-lg transition-all ${
                    tone === t.value ? `bg-primary/20 text-primary shadow-sm` : 'text-muted hover:text-foreground'
                  }`}
                >
                  {t.icon}
                </button>
              ))}
            </div>

            <button 
              className={`p-2 rounded-lg transition-colors ${isFocusMode ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-surface-hover text-muted'}`}
              title="Focus Mode (Ctrl+Shift+F)"
              onClick={() => setIsFocusMode(!isFocusMode)}
            >
              <Maximize2 size={16} />
            </button>

            <button 
              className="p-2 hover:bg-surface-hover rounded-lg text-muted"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <Clock size={16} />
            </button>

            <div className="relative">
              <button 
                className="btn-primary btn-sm flex items-center gap-2 py-2 px-4 shadow-none border border-primary/20"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <DownloadCloud size={16} /> 
                <span className="text-[10px] font-bold uppercase tracking-widest">Export</span>
              </button>
              
              <AnimatePresence>
                {showExportOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 bg-surface glassmorphism border border-border rounded-xl shadow-2xl p-1 z-50 min-w-[200px]"
                  >
                    <button className="w-full px-4 py-2 hover:bg-primary/10 hover:text-primary rounded-lg text-left text-xs transition-colors" onClick={handleExportWattpad}>Wattpad Format (.txt)</button>
                    <button className="w-full px-4 py-2 hover:bg-primary/10 hover:text-primary rounded-lg text-left text-xs transition-colors" onClick={() => {
                      navigator.clipboard.writeText(editor?.getText() || "");
                      setShowExportOptions(false);
                      alert("Copied raw text to clipboard!");
                    }}>Copy RAW Text</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="sanctuary-container">
           {editor && <FloatingToolbar editor={editor} />}
           {editor && <AIBubbleMenu editor={editor} onConjureTwist={handleConjureTwist} />}
           <EditorContent editor={editor} className="tiptap-container" />
        </div>
      </main>

      {/* Floating Sanctuary Sidebar - Moved to Right */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.aside 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="editor-sidebar"
          >
            <div className="sidebar-header mb-8">
              <h2 className="text-2xl font-bold tracking-tighter text-primary">{currentStory.title}</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted">{currentStory.genre}</p>
            </div>
            
            <div className="chapters-list flex-1">
              <label className="text-[10px] font-bold uppercase text-muted mb-4 block">Manuscript Chapters</label>
              {currentStory.chapters.map((chap) => (
                <div key={chap.id} className="chapter-item active group flex items-center justify-between">
                  <span>{chap.title}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Save size={12} className="text-muted" />
                  </div>
                </div>
              ))}
            </div>

            <div className="ai-ideas-section pt-8">
              <button 
                className="btn-primary w-full flex justify-center items-center gap-2 mb-4 py-3 text-sm shadow-none bg-primary/10 border border-primary/20 hover:bg-primary/20"
                onClick={handleFetchAiSuggestions}
                disabled={loadingSuggestions}
              >
                <Sparkles size={16} /> 
                {loadingSuggestions ? "Consulting..." : "Arcane Suggestions"}
              </button>
              
              <AnimatePresence>
                {aiSuggestions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="suggestions-card glassmorphism p-4 border border-primary/10 rounded-xl"
                  >
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-[9px] font-bold text-primary uppercase mb-2">Refined Titles</h5>
                        <ul className="text-xs space-y-1 opacity-80">
                          {aiSuggestions.storyTitles.slice(0, 2).map((t: string, i: number) => <li key={i}>• {t}</li>)}
                        </ul>
                      </div>
                      <div>
                         <h5 className="text-[9px] font-bold text-red-500 uppercase mb-2">Click-worthy</h5>
                         <ul className="text-xs space-y-1 opacity-80">
                            {aiSuggestions.youtubeTitles.slice(0, 2).map((t: string, i: number) => <li key={i}>• {t}</li>)}
                         </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Optional YouTube Script view pane based on mode */}
      {currentStory.mode === "youtube" && (
        <ScriptPane editor={editor} />
      )}

      {showVersionHistory && (
        <VersionHistoryPanel 
          storyId={id} 
          currentChapterId={currentStory.chapters[0]?.id}
          editor={editor}
          onClose={() => setShowVersionHistory(false)} 
        />
      )}

      <ArcaneOracle 
        isOpen={showOracle}
        onClose={() => setShowOracle(false)}
        twists={oracleTwists}
        isLoading={isOracleLoading}
        onRegenerate={handleConjureTwist}
        onInsert={handleInsertTwist}
      />
    </div>
  );
}
