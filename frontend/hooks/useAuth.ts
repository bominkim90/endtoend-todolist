"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectToGoogleLogin } from "@/lib/api/auth";
import { useGetMeQuery, useLogoutMutation } from "@/lib/api/apiSlice";

// 인증 관련 로직 — RTK Query로 유저 조회/로그아웃
export function useAuth(options?: { skip?: boolean }) {
  const router = useRouter();
  const { data: user, isLoading, isFetching, isError } = useGetMeQuery(
    undefined,
    { skip: options?.skip },
  );
  const [logout] = useLogoutMutation();

  const isInitialized = !isLoading && !isFetching;

  const handleGoogleLogin = () => {
    redirectToGoogleLogin();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // 로그아웃 실패해도 로그인 페이지로 이동
    } finally {
      router.push("/login");
    }
  };

  return {
    user,
    isLoading: isLoading || isFetching,
    isInitialized,
    isAuthenticated: !!user && !isError,
    handleGoogleLogin,
    handleLogout,
  };
}

// 보호된 페이지 — 미인증 시 /login 리다이렉트
export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading, isInitialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  return { user, isLoading: isLoading || !isInitialized };
}
