"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import type { Todo } from "@/types/todo";

interface TodoCardProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

// 투두 목록 카드 — 완료 토글, 상세 이동, 삭제
export default function TodoCard({
  todo,
  onToggleComplete,
  onDelete,
}: TodoCardProps) {
  const handleDelete = () => {
    if (window.confirm("이 투두를 삭제할까요?")) {
      onDelete(todo.id);
    }
  };

  return (
    <article
      className={`rounded-xl border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-opacity ${
        todo.completed ? "border-[#E0E3E3] opacity-60" : "border-[#E0E3E3]"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggleComplete(todo.id)}
          className="mt-1 h-5 w-5 cursor-pointer rounded border-[#C4C7C7]"
          aria-label={`${todo.title} 완료 토글`}
        />

        <div className="min-w-0 flex-1">
          <Link href={`/todos/${todo.id}`} className="block">
            <h2
              className={`text-lg font-medium text-[#191C1D] ${
                todo.completed ? "line-through" : ""
              }`}
            >
              {todo.title}
            </h2>
          </Link>
          <p className="mt-1 text-sm text-[#747878]">
            {formatDate(todo.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/todos/${todo.id}/edit`}
            className="rounded-lg px-3 py-1.5 text-sm text-[#444748] hover:bg-[#F8F9FA]"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>
    </article>
  );
}
