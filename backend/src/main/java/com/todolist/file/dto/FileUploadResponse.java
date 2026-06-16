package com.todolist.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 이미지 업로드 API 응답 DTO
 */
@Getter
@AllArgsConstructor
public class FileUploadResponse {

	private String url;
}
