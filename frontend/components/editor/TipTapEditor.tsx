"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef } from "react";
import { useUploadImageMutation } from "@/lib/api/apiSlice";

interface TipTapEditorProps {
  content?: string;
  onChange?: (json: string) => void;
  editable?: boolean;
}

// TipTap 리치 텍스트 에디터 — RTK Query로 S3 이미지 업로드
export default function TipTapEditor({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
    ],
    content: content ? JSON.parse(content) : undefined,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange?.(JSON.stringify(ed.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor || content === undefined) return;

    const current = JSON.stringify(editor.getJSON());
    if (content !== current) {
      editor.commands.setContent(content ? JSON.parse(content) : "");
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        const url = await uploadImage(file).unwrap();
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "이미지 업로드에 실패했습니다.",
        );
      }
    },
    [editor, uploadImage],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  if (!editor) {
    return (
      <div className="min-h-[200px] animate-pulse rounded-lg border border-[#E0E3E3] bg-[#F8F9FA]" />
    );
  }

  return (
    <div className="rounded-lg border border-[#E0E3E3] bg-white">
      {editable && (
        <div className="flex gap-2 border-b border-[#E0E3E3] px-3 py-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded px-2 py-1 text-sm ${
              editor.isActive("bold")
                ? "bg-[#191C1D] text-white"
                : "text-[#444748] hover:bg-[#F8F9FA]"
            }`}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded px-2 py-1 text-sm italic ${
              editor.isActive("italic")
                ? "bg-[#191C1D] text-white"
                : "text-[#444748] hover:bg-[#F8F9FA]"
            }`}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded px-2 py-1 text-sm text-[#444748] hover:bg-[#F8F9FA]"
          >
            이미지
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      <EditorContent
        editor={editor}
        className="tiptap-editor min-h-[200px] px-4 py-3 text-[#191C1D]"
      />
    </div>
  );
}
