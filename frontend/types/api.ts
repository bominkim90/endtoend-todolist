// 백엔드 공통 API 응답 포맷
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
