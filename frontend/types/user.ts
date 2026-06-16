// 유저 정보 타입 (GET /api/users/me)
export interface User {
  id: number;
  email: string;
  nickname: string;
  provider: string;
  createdAt: string;
}
