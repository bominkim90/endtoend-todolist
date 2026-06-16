"use client";

import Header from "@/components/layout/Header";
import { useRequireAuth } from "@/hooks/useAuth";

// 투두 페이지 공통 레이아웃 — 인증 가드 + 헤더
export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#747878]">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
