import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "@/types/api";
import type { Todo, TodoCreateRequest, TodoUpdateRequest } from "@/types/todo";
import type { User } from "@/types/user";
import { baseQueryWithReauth, getApiUrl } from "@/lib/api/baseQuery";

// 백엔드 공통 응답 { success, message, data } 언래핑
function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.data;
}

export const todoApi = createApi({
  reducerPath: "todoApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Todo"],
  endpoints: (builder) => ({
    // GET /api/users/me
    getMe: builder.query<User, void>({
      query: () => "/api/users/me",
      transformResponse: (response: ApiResponse<User>) =>
        unwrapResponse(response),
      providesTags: ["User"],
    }),

    // POST /api/auth/logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        unwrapResponse(response);
      },
      invalidatesTags: ["User", "Todo"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(todoApi.util.resetApiState());
        } catch {
          dispatch(todoApi.util.resetApiState());
        }
      },
    }),

    // GET /api/todos
    getTodos: builder.query<Todo[], void>({
      query: () => "/api/todos",
      transformResponse: (response: ApiResponse<Todo[]>) =>
        unwrapResponse(response),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Todo" as const, id })),
              { type: "Todo", id: "LIST" },
            ]
          : [{ type: "Todo", id: "LIST" }],
    }),

    // GET /api/todos/{id}
    getTodo: builder.query<Todo, number>({
      query: (id) => `/api/todos/${id}`,
      transformResponse: (response: ApiResponse<Todo>) =>
        unwrapResponse(response),
      providesTags: (_result, _error, id) => [{ type: "Todo", id }],
    }),

    // POST /api/todos
    createTodo: builder.mutation<Todo, TodoCreateRequest>({
      query: (body) => ({
        url: "/api/todos",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Todo>) =>
        unwrapResponse(response),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),

    // PUT /api/todos/{id}
    updateTodo: builder.mutation<
      Todo,
      { id: number; body: TodoUpdateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/todos/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Todo>) =>
        unwrapResponse(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Todo", id },
        { type: "Todo", id: "LIST" },
      ],
    }),

    // DELETE /api/todos/{id}
    deleteTodo: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/todos/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => {
        unwrapResponse(response);
      },
      invalidatesTags: (_result, _error, id) => [
        { type: "Todo", id },
        { type: "Todo", id: "LIST" },
      ],
    }),

    // PATCH /api/todos/{id}/complete
    toggleTodoComplete: builder.mutation<Todo, number>({
      query: (id) => ({
        url: `/api/todos/${id}/complete`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiResponse<Todo>) =>
        unwrapResponse(response),
      invalidatesTags: (_result, _error, id) => [
        { type: "Todo", id },
        { type: "Todo", id: "LIST" },
      ],
    }),

    // POST /api/files/upload — multipart는 queryFn으로 처리
    uploadImage: builder.mutation<string, File>({
      queryFn: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(getApiUrl("/api/files/upload"), {
            method: "POST",
            credentials: "include",
            headers: { Accept: "application/json" },
            body: formData,
          });

          const json = (await response.json()) as ApiResponse<{ url: string }>;

          if (!response.ok || !json.success) {
            return {
              error: {
                status: response.status,
                data: json.message ?? "이미지 업로드에 실패했습니다.",
              },
            };
          }

          return { data: json.data.url };
        } catch {
          return {
            error: {
              status: "FETCH_ERROR",
              error: "이미지 업로드에 실패했습니다.",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,
  useGetTodosQuery,
  useGetTodoQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
  useToggleTodoCompleteMutation,
  useUploadImageMutation,
} = todoApi;
