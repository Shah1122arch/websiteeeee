import { Editor } from "@tiptap/react";
import { Bold, Italic, Heading1, Heading2, Quote } from "lucide-react";

export function FloatingToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  return (
    <div className="floating-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive("bold") ? "active" : ""}`}
      >
        <Bold size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive("italic") ? "active" : ""}`}
      >
        <Italic size={18} />
      </button>

      <div className="toolbar-divider" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
      >
        <Heading1 size={18} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
      >
        <Heading2 size={18} />
      </button>

      <div className="toolbar-divider" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive("blockquote") ? "active" : ""}`}
      >
        <Quote size={18} />
      </button>
    </div>
  );
}
