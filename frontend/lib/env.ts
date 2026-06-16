// 브라우저에 노출 가능한 환경변수만 관리 (NEXT_PUBLIC_ prefix)
const DEFAULT_API_URL = "http://localhost:8080";

function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (url) {
    return url.replace(/\/$/, "");
  }

  // .env.local 미설정 시 로컬 개발 기본값
  if (process.env.NODE_ENV === "development") {
    return DEFAULT_API_URL;
  }

  throw new Error(
    "NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.",
  );
}

export const env = {
  apiUrl: getApiUrl(),
} as const;
