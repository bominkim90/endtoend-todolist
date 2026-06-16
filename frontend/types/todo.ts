// 투두 타입 (백엔드 TodoResponse와 동일)
export interface Todo {
  id: number;
  title: string;
  content: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoCreateRequest {
  title: string;
  content?: string;
}

export interface TodoUpdateRequest {
  title: string;
  content?: string;
}
