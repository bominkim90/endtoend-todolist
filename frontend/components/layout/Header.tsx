"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// 상단 헤더 — 로고, 유저 닉네임, 로그아웃
export default function Header() {
  const { user, handleLogout } = useAuth();

  return (
    <header className="border-b border-[#E0E3E3] bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/todos"
          className="text-xl font-medium tracking-tight text-black"
        >
          TodoList
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-[#444748]">{user.nickname}</span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[#C4C7C7] px-4 py-2 text-sm text-[#444748] transition-colors hover:bg-[#F8F9FA]"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
