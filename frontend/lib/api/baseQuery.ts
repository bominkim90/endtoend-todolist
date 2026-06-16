import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { env } from "@/lib/env";

const API_URL = env.apiUrl;

// httpOnly 쿠키 기반 fetch — credentials: 'include' 필수
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

// 401 응답 시 refresh 후 1회 재시도
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const url = typeof args === "string" ? args : args.url;

    if (!url.includes("/api/auth")) {
      const refreshResult = await rawBaseQuery(
        { url: "/api/auth/refresh", method: "POST" },
        api,
        extraOptions,
      );

      if (!refreshResult.error) {
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}
