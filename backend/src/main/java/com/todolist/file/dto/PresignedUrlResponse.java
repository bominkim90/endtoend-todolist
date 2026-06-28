package com.todolist.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * S3 Presigned URL 발급 응답 DTO
 */
@Getter
@AllArgsConstructor
public class PresignedUrlResponse {

	private String presignedUrl;
	private String fileUrl;
}
