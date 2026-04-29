"use client";

import { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Sparkles, Wand2, Maximize2 } from "lucide-react";
import { useState } from "react";
import { rewriteText, expandText } from "../../lib/ai";
import { getAIUsage, incrementAIToken, MAX_FREE_AI_USES } from "../../lib/analytics";

export function AIBubbleMenu({ editor, onConjureTwist }: { editor: Editor; onConjureTwist: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  if (!editor) return null;

  const handleRewrite = async () => {
    if (getAIUsage() >= MAX_FREE_AI_USES) {
      alert("You have reached your daily AI limit. Upgrade to Pro for unlimited Arcane power.");
      return;
    }
    try {
      setIsProcessing(true);
      setActiveAction("refine");
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      const newText = await rewriteText(text, "dramatic");
      editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
      incrementAIToken();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "The spell failed. Try again.";
      alert(msg);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const handleExpand = async () => {
    if (getAIUsage() >= MAX_FREE_AI_USES) {
      alert("You have reached your daily AI limit. Upgrade to Pro for unlimited Arcane power.");
      return;
    }
    try {
      setIsProcessing(true);
      setActiveAction("enhance");
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      const newText = await expandText(text);
      editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
      incrementAIToken();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "The spell failed. Try again.";
      alert(msg);
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  return (
    <BubbleMenu editor={editor} className="ai-bubble-menu">
      <div className="bubble-content">
        <Sparkles size={15} className="text-primary bubble-sparkle" />
        <span className="bubble-title">Arcane</span>
        <button
          className={`bubble-btn ${activeAction === "refine" ? "bubble-btn--shimmer" : ""}`}
          onClick={handleRewrite}
          disabled={isProcessing}
          title="Refine — rewrite with cinematic intensity"
        >
          <Wand2 size={13} />
          {activeAction === "refine" ? "Casting..." : "Refine"}
        </button>
        <button
          className={`bubble-btn ${activeAction === "enhance" ? "bubble-btn--shimmer" : ""}`}
          onClick={handleExpand}
          disabled={isProcessing}
          title="Enhance — expand with more depth"
        >
          <Maximize2 size={13} />
          {activeAction === "enhance" ? "Casting..." : "Enhance"}
        </button>
        <button
          className="bubble-btn"
          onClick={onConjureTwist}
          disabled={isProcessing}
          title="Conjure Twist — Consult the Oracle"
        >
          <Sparkles size={13} />
          Oracle
        </button>
      </div>
    </BubbleMenu>
  );
}
