"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { useGetTodoQuery, useUpdateTodoMutation } from "@/lib/api/apiSlice";

// 투두 수정 페이지
export default function EditTodoPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useGetTodoQuery(id, { skip: Number.isNaN(id) });
  const [updateTodo, { isLoading: isSubmitting }] = useUpdateTodoMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

    try {
      await updateTodo({
        id,
        body: { title: title.trim(), content: content || undefined },
      }).unwrap();
      router.push(`/todos/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "수정에 실패했습니다.");
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
          <TipTapEditor content={content} onChange={setContent} />
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
            {isSubmitting ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </main>
  );
}
