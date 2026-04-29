"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Sparkles, 
  Wand2, 
  ChevronRight, 
  RotateCcw, 
  ArrowRight, 
  PenTool,
  Shield,
  Target,
  Zap,
  BookOpen
} from "lucide-react";
import { useStoryStore } from "../../../store/useStoryStore";
import { conjureIdea, critiqueIdea, refineIdea, expandStory, generateOpening, generateCoverPrompt } from "../../../lib/ai";
import { v4 as uuidv4 } from "uuid";

const GENRES = ["Fantasy", "Sci-Fi", "Thriller", "Horror", "Romance", "Cyberpunk", "Mystery"];
const STYLES = ["Cinematic", "Gritty", "Poetic", "Emotional", "Fast-paced"];
const TONES = [
  { id: "hero", label: "Heroic", icon: <Shield size={16} />, color: "text-yellow-400" },
  { id: "neutral", label: "Neutral", icon: <Zap size={16} />, color: "text-blue-400" },
  { id: "villain", label: "Villainous", icon: <Target size={16} />, color: "text-red-500" },
];

const FALLBACK_COVERS: Record<string, string> = {
  "Sci-Fi": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000",
  "Fantasy": "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1000",
  "Horror": "https://images.unsplash.com/photo-1505635330303-319530274873?q=80&w=1000",
  "Romance": "https://images.unsplash.com/photo-1516589174184-c685266e44d3?q=80&w=1000",
  "Thriller": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000",
  "Mystery": "https://images.unsplash.com/photo-1585862705417-770932223bb3?q=80&w=1000",
  "Cyberpunk": "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1000"
};

export default function CreationHub() {
  const router = useRouter();
  const addStory = useStoryStore((state) => state.addStory);
  
  const [step, setStep] = useState(0); 
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Conjuring idea...");
  
  // Input State
  const [prompt, setPrompt] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [tone, setTone] = useState("neutral");
  const [style, setStyle] = useState(STYLES[0]);
  
  // Result State
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [opening, setOpening] = useState("");
  const [coverPrompt, setCoverPrompt] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [aiCritique, setAiCritique] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartBlank = () => {
    const id = uuidv4();
    const newStory = {
      id,
      title: "Untitled Story",
      genre: "General",
      description: "Start writing your masterpiece...",
      coverImage: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: "story" as const,
      tone: "neutral" as const,
      chapters: [
        { id: uuidv4(), title: "Chapter 1", content: { type: "doc", content: [] }, order: 1 }
      ]
    };
    addStory(newStory);
    router.push(`/editor/${id}`);
  };

  const onConjure = async () => {
    if (!prompt.trim()) return;
    
    // RIGID STATE RESET
    setTitle("");
    setHook("");
    setSynopsis("");
    setOpening("");
    setCoverImage(null);
    setAiCritique("");
    setError(null);
    
    setIsLoading(true);
    setLoadingMessage("Summoning the Arcane AI...");
    
    try {
      // Step 1: Initial Conjure
      const initial = await conjureIdea(prompt, genre, tone, style);
      
      // Step 2: Critique & Refine
      setLoadingMessage("Refining narrative essence...");
      const critique = await critiqueIdea(initial.title, initial.hook);
      setAiCritique(critique.critique);
      
      try {
        const refined = await refineIdea(initial.title, initial.hook, critique.critique);
        setTitle(refined.title);
        setHook(refined.hook);
      } catch (refineError) {
        console.warn("Refinement failed, relying on original spark", refineError);
        setAiCritique("Refinement was unstable; using original Arcane spark.");
        setTitle(initial.title);
        setHook(initial.hook);
      }
      
      setStep(2);
    } catch (err: any) {
      console.error("Conjure Error:", err);
      setError("The AI was unable to materialize your vision. Providing a genre-aware spark.");
      // Fallback is handled by robustGenerate in the backend
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const onExpandStory = async () => {
    setIsLoading(true);
    setLoadingMessage("Expanding story threads...");
    try {
      const { synopsis } = await expandStory(title, hook, genre, tone);
      setSynopsis(synopsis);
      setStep(3);
    } catch (e: any) {
      alert(e.message || "Failed to expand the narrative threads.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGenerateOpening = async () => {
    setIsLoading(true);
    setLoadingMessage("Manifesting opening scene (Gemini Pro)...");
    try {
      const text = await generateOpening(title, hook, synopsis, tone, style);
      setOpening(text);
      setStep(4);
    } catch (e: any) {
      // FALLBACK: Don't lock the user out of the editor if the opening scene fails
      console.warn("Opening scene manifestation failed", e);
      setOpening("We couldn't generate the opening scene right now, but your story constraints are set! Begin writing here...");
      setStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const onManifestVisuals = async () => {
    setIsLoading(true);
    setLoadingMessage("Weaving Visual Essence...");
    try {
      const response = await generateCoverPrompt(title, synopsis, genre);
      setCoverPrompt(response.visualPrompt);
      
      // Dynamic loremflickr Pipeline with cache busting
      const query = encodeURIComponent(response.searchQuery || genre);
      const timestamp = Date.now();
      const imageUrl = `https://loremflickr.com/800/1200/${query},cinematic,moody/all?lock=${timestamp}`;
      
      setCoverImage(imageUrl);
      setStep(5);
    } catch (e: any) {
      console.warn("Visual manifestation failed", e);
      // Fallback System
      const fallbackUrl = FALLBACK_COVERS[genre] || FALLBACK_COVERS["Sci-Fi"];
      setCoverImage(fallbackUrl);
      setStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = () => {
    const id = uuidv4();
    const newStory = {
      id,
      title,
      genre,
      description: synopsis,
      coverImage: coverImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: "story" as const,
      tone: tone as any,
      chapters: [
        { 
          id: uuidv4(), 
          title: "Chapter 1: The Beginning", 
          content: { 
            type: "doc", 
            content: [
              { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Chapter 1: The Beginning" }] },
              { type: "paragraph", content: [{ type: "text", text: opening }] }
            ] 
          }, 
          order: 1 
        }
      ]
    };
    addStory(newStory);
    router.push(`/editor/${id}`);
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 1.02, transition: { duration: 0.3 } }
  };

  return (
    <div className="creation-hub min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background magical elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="bg-glow bg-glow-primary scale-150 opacity-20"></div>
        <div className="bg-glow bg-glow-secondary top-auto bottom-0 right-0 scale-150 opacity-20"></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-4xl text-center"
          >
            <h1 className="text-5xl font-bold mb-4 tracking-tighter">Forge your next world.</h1>
            <p className="text-xl text-muted mb-16">Choose how you wish to begin your narrative journey.</p>
            
            <div className="hub-choice-grid">
              <button 
                onClick={() => setStep(1)}
                className="hub-choice-card group primary"
              >
                <div className="hub-card-icon">
                  <Sparkles size={40} />
                </div>
                <h3 className="hub-card-title">Conjure with AI</h3>
                <p className="hub-card-description">Step-by-step guided creation using advanced arcane intelligence.</p>
              </button>
              
              <button 
                onClick={handleStartBlank}
                className="hub-choice-card group"
              >
                <div className="hub-card-icon secondary">
                  <PenTool size={40} />
                </div>
                <h3 className="hub-card-title">Blank Page</h3>
                <p className="hub-card-description">Start from scratch with total creative freedom.</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-3xl card p-8 glassmorphism shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Plus size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Step 1: The Spark</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Describe your story idea...</h2>
            
            <div className="space-y-6">
              <div className="relative">
                <textarea 
                  className="w-full h-40 bg-background/50 border border-border rounded-xl p-6 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-lg placeholder:opacity-30"
                  placeholder="A noir detective in a city of bioluminescent clouds..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted">
                  Be as vague or detailed as you like.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Genre</label>
                  <select 
                    className="w-full bg-surface border border-border rounded-lg p-2 outline-none focus:border-primary"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  >
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Style</label>
                  <select 
                    className="w-full bg-surface border border-border rounded-lg p-2 outline-none focus:border-primary"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Tone</label>
                  <div className="flex gap-2">
                    {TONES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`flex-1 p-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                          tone === t.id ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-border text-muted hover:border-text-muted'
                        }`}
                        title={t.label}
                      >
                        {t.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between">
                <button onClick={() => setStep(0)} className="btn-secondary">Cancel</button>
                <button 
                  onClick={onConjure} 
                  disabled={isLoading || !prompt}
                  className={`btn-primary px-8 ${isLoading ? 'animate-pulse opacity-70' : ''}`}
                >
                  {isLoading ? loadingMessage : 'Conjure Idea'} <Sparkles size={18} className="ml-2" />
                </button>
              </div>
              {aiCritique && step === 1 && isLoading && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm italic text-primary/80"
                 >
                   "Refining: {aiCritique}"
                 </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-3xl card p-8 glassmorphism shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Zap size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Step 2: The Core</span>
            </div>

            <div className="space-y-8">
              {aiCritique && (
                 <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-xs italic text-primary/70 mb-4">
                   <div className="font-bold uppercase tracking-widest text-[8px] mb-1 opacity-50">Excellence Filter Applied:</div>
                   "{aiCritique}"
                 </div>
              )}
              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-muted uppercase">Title</label>
                  <button onClick={onConjure} className="hover:text-primary transition-colors">
                    <RotateCcw size={14} />
                  </button>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-primary/20 shadow-inner group-hover:border-primary/40 transition-colors">
                  <input 
                    type="text" 
                    className="bg-transparent w-full text-4xl font-bold outline-none tracking-tight"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-muted uppercase">Narrative Hook</label>
                  <button onClick={onConjure} className="hover:text-primary transition-colors">
                    <RotateCcw size={14} />
                  </button>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-border group-hover:border-primary/30 transition-colors">
                  <textarea 
                    className="bg-transparent w-full h-24 outline-none text-xl resize-none italic leading-relaxed"
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button 
                  onClick={onExpandStory} 
                  disabled={isLoading}
                  className={`btn-primary px-8 ${isLoading ? 'animate-pulse opacity-70' : ''}`}
                >
                   {isLoading ? loadingMessage : 'Expand Story'} <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-3xl card p-8 glassmorphism shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Sparkles size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Step 3: The Narrative</span>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold underline decoration-primary/40 underline-offset-8">Synopsis</h2>
              
              <div className="bg-surface/50 p-8 rounded-2xl border border-border relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onExpandStory} className="text-muted hover:text-primary"><RotateCcw size={16} /></button>
                 </div>
                 <textarea 
                    className="bg-transparent w-full h-64 outline-none text-xl leading-8 resize-none"
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                 />
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
                <button 
                  onClick={onGenerateOpening} 
                  disabled={isLoading}
                  className={`btn-primary px-8 ${isLoading ? 'animate-pulse' : ''}`}
                >
                   {isLoading ? loadingMessage : 'Conjure Opening Scene'} <Wand2 size={18} className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-5xl card p-12 glassmorphism shadow-2xl border-primary/20"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2 text-primary">
                <BookOpen size={20} />
                <span className="text-sm font-bold uppercase tracking-widest">Final Step: The First Chapter</span>
              </div>
              <button onClick={onGenerateOpening} className="btn-ghost flex gap-2">
                <RotateCcw size={16} /> Reweave Scene
              </button>
            </div>

            <div className="editor-preview bg-black/20 p-10 rounded-2xl border border-border/50 mb-10 shadow-inner">
               <div className="max-w-2xl mx-auto">
                  <h1 className="text-4xl font-bold mb-8 font-heading">{title}</h1>
                  <div className="prose prose-invert prose-lg max-w-none">
                     <p className="whitespace-pre-wrap leading-loose font-serif opacity-90 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                        {opening}
                     </p>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(3)} className="btn-secondary">Back to Synopsis</button>
              <div className="flex gap-4">
                 <button onClick={handleStartBlank} className="btn-ghost">Discard & Start Blank</button>
                 <button onClick={onManifestVisuals} className="btn-primary px-12 py-4 text-lg">
                    Casting the Visual Soul <ChevronRight size={20} className="ml-1" />
                 </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5" 
            variants={containerVariants} 
            initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-4xl card p-10 glassmorphism shadow-2xl border-primary/20 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-8 text-primary">
              <Sparkles size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Step 5: The Visual Soul</span>
            </div>

            <h2 className="text-4xl font-bold mb-4">Your Story's Visage</h2>
            <p className="text-muted mb-10 max-w-xl mx-auto">AI has woven a cinematic cover to represent the soul of your narrative.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mt-12">
               <motion.div 
                 key={coverImage || 'empty'}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="cover-art-container group"
               >
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt="Cover Preview" 
                      className="transition-opacity duration-700"
                      onError={() => {
                        const fb = FALLBACK_COVERS[genre] || FALLBACK_COVERS["Sci-Fi"];
                        if (coverImage !== fb) setCoverImage(fb);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-hover animate-pulse flex items-center justify-center">
                       <Sparkles className="text-primary/20" size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-left pointer-events-none">
                     <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                     <p className="text-primary text-sm uppercase tracking-tighter font-bold">{genre}</p>
                  </div>
               </motion.div>

               <div className="text-left space-y-6">
                  <div className="p-6 bg-surface/50 rounded-2xl border border-border shadow-inner">
                     <h4 className="text-xs font-bold text-muted uppercase mb-3 tracking-widest">Visual Incantation</h4>
                     <p className="text-lg italic leading-relaxed opacity-80">"{coverPrompt || "A minimalist, dark cinematic atmosphere representing the core themes of the story."}"</p>
                  </div>

                  <div className="pt-6 flex flex-col gap-4">
                     <button onClick={onFinish} className="btn-primary w-full py-5 text-xl justify-center">
                        Enter the Sanctuary <ArrowRight size={24} className="ml-2" />
                     </button>
                     <div className="flex gap-4">
                        <button onClick={() => setStep(4)} className="btn-ghost flex-1">Back to Prose</button>
                        <button onClick={onManifestVisuals} className="btn-secondary flex-1">Reweave Visuals</button>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .creation-hub {
           background-color: #0b0b12;
        }
        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(120px);
        }
        .bg-glow-primary {
          background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
          top: -200px;
          left: -200px;
        }
        .bg-glow-secondary {
          background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
          bottom: -200px;
          right: -200px;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-primary {
          background: var(--primary);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.2);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.3);
          background: var(--primary-hover);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .btn-ghost {
          color: rgba(255, 255, 255, 0.5);
          padding: 0.75rem 1.5rem;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        .animate-pulse {
           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
