"use client";

import Link from "next/link";
import TodoCard from "@/components/todos/TodoCard";
import {
  useDeleteTodoMutation,
  useGetTodosQuery,
  useToggleTodoCompleteMutation,
} from "@/lib/api/apiSlice";

// 내 투두 목록 페이지 — RTK Query로 데이터 조회/변경
export default function TodosPage() {
  const { data: todos = [], isLoading, isError, error } = useGetTodosQuery();
  const [toggleComplete] = useToggleTodoCompleteMutation();
  const [deleteTodo] = useDeleteTodoMutation();

  const errorMessage =
    isError && error && "data" in error
      ? String(error.data)
      : isError
        ? "목록을 불러오지 못했습니다."
        : null;

  const handleToggleComplete = async (id: number) => {
    try {
      await toggleComplete(id).unwrap();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다.",
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id).unwrap();
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-[#191C1D]">내 투두</h1>
        <Link
          href="/todos/new"
          className="rounded-lg bg-[#191C1D] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
        >
          새 투두
        </Link>
      </div>

      {isLoading && (
        <p className="text-center text-[#747878]">불러오는 중...</p>
      )}

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-red-600">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && todos.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#C4C7C7] bg-white py-16 text-center">
          <p className="text-[#747878]">아직 투두가 없습니다.</p>
          <Link
            href="/todos/new"
            className="mt-4 inline-block text-sm text-[#191C1D] underline"
          >
            첫 투두 만들기
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </main>
  );
}
