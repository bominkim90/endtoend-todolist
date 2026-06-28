"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TipTapEditor, {
  type TipTapEditorHandle,
} from "@/components/editor/TipTapEditor";
import { prepareContentForSave } from "@/lib/api/uploadContentImages";
import { useGetTodoQuery, useUpdateTodoMutation } from "@/lib/api/apiSlice";

// 투두 수정 페이지
export default function EditTodoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const editorRef = useRef<TipTapEditorHandle>(null);

  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useGetTodoQuery(id, { skip: Number.isNaN(id) });
  const [updateTodo] = useUpdateTodoMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setContent(todo.content ?? "");
    }
  }, [todo]);

  const errorMessage =
    isError && error && "data" in error
      ? String(error.data)
      : isError
        ? "투두를 불러오지 못했습니다."
        : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!editorRef.current) {
      alert("에디터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const json = editorRef.current.getJSON();
      const fileMap = editorRef.current.getPendingFiles();

      const finalContent = await prepareContentForSave(
        json,
        fileMap,
        (current, total) => {
          setUploadProgress({ current, total });
        },
      );

      await updateTodo({
        id,
        body: { title: title.trim(), content: finalContent || undefined },
      }).unwrap();

      editorRef.current.revokeBlobUrls();
      router.push(`/todos/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-[#747878]">불러오는 중...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-red-600">{errorMessage}</p>
        <Link href="/todos" className="mt-4 inline-block text-sm underline">
          목록으로
        </Link>
      </main>
    );
  }

  const submitLabel = uploadProgress
    ? `이미지 업로드 중...(${uploadProgress.current}/${uploadProgress.total})`
    : isSubmitting
      ? "저장 중..."
      : "저장";

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <Link
          href={`/todos/${id}`}
          className="text-sm text-[#747878] hover:text-[#191C1D]"
        >
          ← 상세로
        </Link>
        <h1 className="mt-2 text-2xl font-medium text-[#191C1D]">
          투두 수정
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-medium text-[#444748]"
          >
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#C4C7C7] px-4 py-3 text-[#191C1D] outline-none focus:border-[#191C1D]"
            maxLength={255}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#444748]">
            내용
          </label>
          <TipTapEditor ref={editorRef} content={content} />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href={`/todos/${id}`}
            className="rounded-lg border border-[#C4C7C7] px-5 py-2.5 text-sm text-[#444748] hover:bg-white"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#191C1D] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
