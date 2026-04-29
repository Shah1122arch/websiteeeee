import { useState } from "react";
import { convertToScript } from "../../lib/ai";
import { ScriptFormat } from "../../types/story";
import { Editor } from "@tiptap/react";
import { FileVideo, Copy, Check } from "lucide-react";

export function ScriptPane({ editor }: { editor: Editor | null }) {
  const [script, setScript] = useState<ScriptFormat | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!editor) return;
    try {
      setIsGenerating(true);
      setError("");
      const text = editor.getText();
      if (text.length < 10) {
        throw new Error("Story is too short to generate a script.");
      }
      const newScript = await convertToScript(text);
      setScript(newScript);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to convert script.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!script) return;
    const formatted = `HOOK:\n${script.hook}\n\nINTRO:\n${script.intro}\n\nBODY:\n${script.body}\n\nOUTRO:\n${script.outro}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="script-pane">
      <div className="script-pane-header">
        <FileVideo size={20} className="text-primary" />
        <h4>YouTube Script View</h4>
      </div>
      
      {!script ? (
        <div className="script-empty">
          <p className="text-muted text-sm mb-4">
            Convert your prose into a structured YouTube storytelling script (Hook, Intro, Body, Outro).
          </p>
          <button 
            className="btn-primary w-full" 
            onClick={handleConvert}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Convert to Script"}
          </button>
          {error && <p className="error-text text-sm mt-2 font-medium" style={{color: 'red'}}>{error}</p>}
        </div>
      ) : (
        <div className="script-content">
          <div className="flex justify-between items-center mb-4">
            <button className="btn-ghost btn-sm" onClick={() => setScript(null)}>← Back</button>
            <button className="btn-secondary btn-sm flex gap-2" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} Copy Script
            </button>
          </div>
          
          <div className="script-section">
            <span className="script-label">HOOK</span>
            <p>{script.hook}</p>
          </div>
          <div className="script-section">
            <span className="script-label">INTRO</span>
            <p>{script.intro}</p>
          </div>
          <div className="script-section">
            <span className="script-label">BODY</span>
            <p>{script.body}</p>
          </div>
          <div className="script-section">
            <span className="script-label">OUTRO</span>
            <p>{script.outro}</p>
          </div>
        </div>
      )}
    </aside>
  );
}
