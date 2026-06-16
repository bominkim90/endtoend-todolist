"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TipTapViewer from "@/components/editor/TipTapViewer";
import { useDeleteTodoMutation, useGetTodoQuery } from "@/lib/api/apiSlice";
import { formatDate } from "@/lib/utils/date";

// 투두 상세 페이지
export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const {
    data: todo,
    isLoading,
    isError,
    error,
  } = useGetTodoQuery(id, { skip: Number.isNaN(id) });
  const [deleteTodo] = useDeleteTodoMutation();

  const errorMessage =
    isError && error && "data" in error
      ? String(error.data)
      : isError
        ? "투두를 불러오지 못했습니다."
        : null;

  const handleDelete = async () => {
    if (!todo || !window.confirm("이 투두를 삭제할까요?")) return;

    try {
      await deleteTodo(todo.id).unwrap();
      router.push("/todos");
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-[#747878]">불러오는 중...</p>
      </main>
    );
  }

  if (errorMessage || !todo) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-red-600">
          {errorMessage ?? "투두를 찾을 수 없습니다."}
        </p>
        <Link href="/todos" className="mt-4 inline-block text-sm underline">
          목록으로
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/todos"
          className="text-sm text-[#747878] hover:text-[#191C1D]"
        >
          ← 목록으로
        </Link>
      </div>

      <article className="rounded-xl border border-[#E0E3E3] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1
              className={`text-2xl font-medium text-[#191C1D] ${
                todo.completed ? "line-through opacity-60" : ""
              }`}
            >
              {todo.title}
            </h1>
            <p className="mt-2 text-sm text-[#747878]">
              {formatDate(todo.createdAt)}
              {todo.completed && (
                <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-green-700">
                  완료
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/todos/${todo.id}/edit`}
              className="rounded-lg border border-[#C4C7C7] px-4 py-2 text-sm text-[#444748] hover:bg-[#F8F9FA]"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        </div>

        <div className="border-t border-[#E0E3E3] pt-6">
          <TipTapViewer content={todo.content} />
        </div>
      </article>
    </main>
  );
}
