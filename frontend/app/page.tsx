"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 루트 — /todos로 이동 (미로그인 시 todos/layout의 useRequireAuth가 /login으로 보냄)
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/todos");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
      <p className="text-[#747878]">로딩 중...</p>
    </div>
  );
}
