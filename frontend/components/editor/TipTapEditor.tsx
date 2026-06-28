"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export interface TipTapEditorHandle {
  getJSON: () => JSONContent;
  getPendingFiles: () => Map<string, File>;
  revokeBlobUrls: () => void;
}

interface TipTapEditorProps {
  content?: string;
  onChange?: (json: string) => void;
  editable?: boolean;
}

// TipTap 에디터 — 이미지는 blob URL로 미리보기, 저장 시점에 S3 업로드
const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(
  function TipTapEditor({ content, onChange, editable = true }, ref) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingFilesRef = useRef<Map<string, File>>(new Map());
    const blobUrlsRef = useRef<Set<string>>(new Set());

    const revokeAllBlobUrls = useCallback(() => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
      pendingFilesRef.current.clear();
    }, []);

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

    useImperativeHandle(
      ref,
      () => ({
        getJSON: () => editor?.getJSON() ?? { type: "doc", content: [] },
        getPendingFiles: () => new Map(pendingFilesRef.current),
        revokeBlobUrls: revokeAllBlobUrls,
      }),
      [editor, revokeAllBlobUrls],
    );

    useEffect(() => {
      if (!editor || content === undefined) return;

      const current = JSON.stringify(editor.getJSON());
      if (content !== current) {
        editor.commands.setContent(content ? JSON.parse(content) : "");
      }
    }, [content, editor]);

    useEffect(() => {
      return () => {
        revokeAllBlobUrls();
      };
    }, [revokeAllBlobUrls]);

    const insertLocalImage = useCallback(
      (file: File) => {
        if (!editor) return;

        const blobUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(blobUrl);
        pendingFilesRef.current.set(blobUrl, file);
        editor.chain().focus().setImage({ src: blobUrl }).run();
      },
      [editor],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          alert("JPEG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.");
        } else {
          insertLocalImage(file);
        }
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
  },
);

export default TipTapEditor;
