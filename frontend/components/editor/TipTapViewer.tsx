"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

interface TipTapViewerProps {
  content: string | null;
}

// TipTap JSON 본문 읽기 전용 렌더러
export default function TipTapViewer({ content }: TipTapViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: content ? JSON.parse(content) : undefined,
    editable: false,
    immediatelyRender: false,
  });

  if (!content) {
    return <p className="text-[#747878]">내용이 없습니다.</p>;
  }

  if (!editor) {
    return (
      <div className="min-h-[100px] animate-pulse rounded-lg bg-[#F8F9FA]" />
    );
  }

  return (
    <EditorContent
      editor={editor}
      className="tiptap-editor text-[#191C1D]"
    />
  );
}
