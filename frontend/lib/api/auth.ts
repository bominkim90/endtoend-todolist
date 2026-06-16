import { getApiUrl } from "@/lib/api/baseQuery";

// Google OAuth 로그인 — 백엔드로 전체 페이지 리다이렉트 (RTK Query 대상 아님)
export function redirectToGoogleLogin(): void {
  window.location.href = getApiUrl("/api/auth/google");
}
