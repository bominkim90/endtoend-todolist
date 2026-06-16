"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/login/LoginCard";
import { useAuth } from "@/hooks/useAuth";

// 로그인 페이지 — 이미 로그인된 경우 /todos로 이동
export default function LoginPage() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/todos");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#747878]">로딩 중...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginCard />;
}
