import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Undo2, Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onReady?: (editor: Editor) => void;
};

export function RichTextEditor({ value, onChange, placeholder, onReady }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "Escreva suas anotações..." }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[220px] px-4 py-3 [&_p]:my-2 [&_h2]:mt-3 [&_h3]:mt-3",
      },
    },
  });

  useEffect(() => {
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);

  if (!editor) return null;

  const Btn = ({
    onClick, active, children, label,
  }: { onClick: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 bg-muted/30">
        <Btn label="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn label="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn label="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-4 w-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="Título" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn label="Subtítulo" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </Btn>
        <Btn label="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn label="Citação" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </Btn>
        <span className="w-px h-5 bg-border mx-1" />
        <Btn label="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn label="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
