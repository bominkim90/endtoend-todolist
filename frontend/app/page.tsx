"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// 루트 — 인증 여부에 따라 /todos 또는 /login으로 리다이렉트
export default function HomePage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;
    router.replace(isAuthenticated ? "/todos" : "/login");
  }, [isInitialized, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
      <p className="text-[#747878]">로딩 중...</p>
    </div>
  );
}
