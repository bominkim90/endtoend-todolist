package com.todolist.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 모든 API 응답의 공통 포맷
 * { success, message, data } 구조로 프론트와 통일
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {

	private final boolean success;
	private final String message;
	private final T data;

	public static <T> ApiResponse<T> success(T data) {
		return new ApiResponse<>(true, "처리 완료", data);
	}

	public static <T> ApiResponse<T> success(String message, T data) {
		return new ApiResponse<>(true, message, data);
	}

	public static <T> ApiResponse<T> fail(String message) {
		return new ApiResponse<>(false, message, null);
	}
}
